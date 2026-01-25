/**
 * Interactive setup flow for KallyAI MCP Server
 * Guides users through authentication process
 */

import { readFile, writeFile, chmod } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import * as readline from "readline";
import { makeApiRequest, handleApiError } from "../services/api-client.js";

const TOKEN_FILE = join(homedir(), ".kallyai_token.json");

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface SubscriptionResponse {
  has_active_subscription: boolean;
  status: string;
  plan?: {
    type: string;
    period: string;
    minutes_included: number;
  };
}

/**
 * Create readline interface for user input
 */
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Prompt user for input
 */
function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Open URL in default browser
 */
async function openBrowser(url: string): Promise<void> {
  const { default: open } = await import("open");
  try {
    await open(url);
  } catch (error) {
    console.error("⚠️  Could not open browser automatically");
    console.log(`\nPlease open this URL manually: ${url}\n`);
  }
}

/**
 * Verify token works by making test API call
 */
async function verifyToken(accessToken: string): Promise<boolean> {
  try {
    const subscription = await makeApiRequest<SubscriptionResponse>(
      "users/me/subscription",
      "GET",
      undefined,
      undefined,
      accessToken
    );
    console.log(`✅ Authentication successful!`);
    if (subscription.has_active_subscription) {
      console.log(`📊 Plan: ${subscription.plan?.type || 'Unknown'} (${subscription.status})`);
    } else {
      console.log(`📊 Status: ${subscription.status}`);
    }
    return true;
  } catch (error) {
    console.error("❌ Token verification failed:", handleApiError(error));
    return false;
  }
}

/**
 * Save token to file with secure permissions
 */
async function saveToken(tokenData: TokenData): Promise<void> {
  const content = JSON.stringify(tokenData, null, 2);
  await writeFile(TOKEN_FILE, content, { mode: 0o600 });

  // Double-check permissions (some systems need explicit chmod)
  await chmod(TOKEN_FILE, 0o600);

  console.log(`\n💾 Token saved to: ${TOKEN_FILE}`);
  console.log(`🔒 File permissions: 600 (owner read/write only)`);
}

/**
 * Parse token from JSON string or object
 */
function parseTokenInput(input: string): TokenData | null {
  try {
    const data = JSON.parse(input);

    // Validate required fields
    if (!data.access_token || !data.refresh_token) {
      return null;
    }

    // Calculate expires_at if not provided
    let expiresAt = data.expires_at;
    if (!expiresAt && data.expires_in) {
      const now = Math.floor(Date.now() / 1000);
      expiresAt = now + data.expires_in;
    }

    if (!expiresAt) {
      // Default to 1 hour if no expiration info
      const now = Math.floor(Date.now() / 1000);
      expiresAt = now + 3600;
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: expiresAt,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Main setup flow
 */
export async function runSetup(): Promise<void> {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              🚀 KallyAI MCP Server Setup 🚀                  ║
║                                                               ║
║  Welcome! Let's get you authenticated to use KallyAI.        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

  const rl = createReadlineInterface();

  try {
    // Check if token already exists
    try {
      const existingToken = await readFile(TOKEN_FILE, "utf-8");
      if (existingToken) {
        console.log(`⚠️  Found existing token at: ${TOKEN_FILE}\n`);
        const overwrite = await prompt(
          rl,
          "Do you want to overwrite it? (yes/no): "
        );

        if (overwrite.toLowerCase() !== "yes" && overwrite.toLowerCase() !== "y") {
          console.log("\n✅ Setup cancelled. Using existing token.\n");
          rl.close();
          return;
        }
      }
    } catch {
      // File doesn't exist, continue with setup
    }

    console.log(`
📋 Setup Instructions:
═══════════════════════════════════════════════════════════════

1️⃣  I'll open the KallyAI web app in your browser
2️⃣  Sign in or create an account at https://kallyai.com/app
3️⃣  Go to Settings → Developer → API Tokens
4️⃣  Create a new token or copy an existing one
5️⃣  Come back here and paste the token JSON

Ready to continue?
`);

    const ready = await prompt(rl, "Press Enter to open browser (or type 'skip' to enter token manually): ");

    if (ready.toLowerCase() !== "skip") {
      console.log("\n🌐 Opening browser...\n");
      await openBrowser("https://kallyai.com/app");
      console.log("Browser opened! Please sign in and get your token.\n");
    }

    console.log(`
📝 Token Format:
═══════════════════════════════════════════════════════════════
The token should be a JSON object like this:

{
  "access_token": "ey...",
  "refresh_token": "ey...",
  "expires_in": 3600
}

You can paste the entire JSON object below.
`);

    // Get token from user
    let tokenData: TokenData | null = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (!tokenData && attempts < maxAttempts) {
      attempts++;
      const tokenInput = await prompt(
        rl,
        "\n🔑 Paste your token JSON here: "
      );

      if (!tokenInput) {
        console.log("❌ No token provided. Please try again.");
        continue;
      }

      tokenData = parseTokenInput(tokenInput);

      if (!tokenData) {
        console.log("❌ Invalid token format. Please make sure you copied the entire JSON object.");
        if (attempts < maxAttempts) {
          console.log(`\nYou have ${maxAttempts - attempts} attempt(s) remaining.`);
        }
      }
    }

    if (!tokenData) {
      console.log(`
❌ Setup failed after ${maxAttempts} attempts.

💡 Tips:
  - Make sure you're copying the entire JSON object
  - The JSON should include "access_token" and "refresh_token"
  - Don't modify the token structure

Try running setup again: npx kallyai-mcp-server --setup
`);
      rl.close();
      process.exit(1);
    }

    console.log("\n🔍 Verifying token...");

    // Verify token works
    const isValid = await verifyToken(tokenData.access_token);

    if (!isValid) {
      console.log(`
❌ Token verification failed. The token may be invalid or expired.

Please try again:
  1. Get a new token from https://kallyai.com/app
  2. Run: npx kallyai-mcp-server --setup
`);
      rl.close();
      process.exit(1);
    }

    // Save token
    await saveToken(tokenData);

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                    ✅ Setup Complete! ✅                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

🎉 You're all set! The KallyAI MCP server is now configured.

📚 Next Steps:
  1. Configure Claude Desktop to use this MCP server
  2. Restart Claude Desktop
  3. Start making AI phone calls!

📖 For Claude Desktop configuration, see:
   https://github.com/Kally-Intelligence-Inc/kallyai-mcp-server#installation

Need help? Email us at support@kallyintelligence.com
`);

    rl.close();
  } catch (error) {
    console.error("\n❌ Setup failed with error:", error);
    console.log("\nPlease try again or contact support@kallyintelligence.com");
    rl.close();
    process.exit(1);
  }
}

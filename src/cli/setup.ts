/**
 * Interactive setup flow for KallyAI MCP Server
 * Uses automatic OAuth via browser with localhost callback
 */

import { createServer, IncomingMessage, ServerResponse } from "http";
import { readFile, writeFile, chmod } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { URL } from "url";
import { randomBytes } from "crypto";
import * as readline from "readline";
import { makeApiRequest, handleApiError } from "../services/api-client.js";
import { API_BASE_URL } from "../constants.js";

// API_BASE_URL is "https://api.kallyai.com/v1", we need base without /v1 for auth
const API_BASE = API_BASE_URL.replace(/\/v1$/, "");

const TOKEN_FILE = join(homedir(), ".kallyai_token.json");
const CALLBACK_PORT_RANGE = { start: 8740, end: 8760 };
const AUTH_TIMEOUT_MS = 180000; // 3 minutes

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface AuthResult {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  state?: string;
  error?: string;
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
 * Generate cryptographically secure random state for CSRF protection
 */
function generateState(): string {
  return randomBytes(32).toString("base64url");
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
    console.log(`\nPlease open this URL manually:\n${url}\n`);
  }
}

/**
 * Find an available port in the specified range
 */
async function findAvailablePort(): Promise<number> {
  for (let port = CALLBACK_PORT_RANGE.start; port <= CALLBACK_PORT_RANGE.end; port++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const server = createServer();
        server.once("error", reject);
        server.once("listening", () => {
          server.close(() => resolve());
        });
        server.listen(port, "127.0.0.1");
      });
      return port;
    } catch {
      continue;
    }
  }
  throw new Error(`No available port in range ${CALLBACK_PORT_RANGE.start}-${CALLBACK_PORT_RANGE.end}`);
}

/**
 * Start local server and wait for OAuth callback
 */
function startCallbackServer(port: number, expectedState: string): Promise<AuthResult> {
  return new Promise((resolve, reject) => {
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
      const params = url.searchParams;

      // Parse callback parameters
      const result: AuthResult = {
        access_token: params.get("access_token") || undefined,
        refresh_token: params.get("refresh_token") || undefined,
        expires_in: params.get("expires_in") ? parseInt(params.get("expires_in")!) : undefined,
        state: params.get("state") || undefined,
        error: params.get("error") || undefined,
      };

      // Send response to browser
      const isSuccess = result.access_token && !result.error;
      const title = isSuccess ? "Authentication Successful!" : "Authentication Failed";
      const color = isSuccess ? "#00d4ff" : "#f87171";
      const message = isSuccess
        ? "You can close this window and return to your terminal."
        : result.error || "Unknown error occurred";

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<!DOCTYPE html>
<html><head><title>KallyAI - ${title}</title></head>
<body style="font-family:system-ui;text-align:center;padding:50px;background:#06080d;color:#e6edf3;">
<h2 style="color:${color};">${title}</h2>
<p>${message}</p>
<script>setTimeout(() => window.close(), 2000);</script>
</body></html>`);

      // Close server and resolve
      server.close();
      resolve(result);
    });

    // Set timeout
    const timeout = setTimeout(() => {
      server.close();
      reject(new Error("Authentication timed out. Please try again."));
    }, AUTH_TIMEOUT_MS);

    server.once("close", () => clearTimeout(timeout));
    server.once("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    server.listen(port, "127.0.0.1");
  });
}

/**
 * Perform OAuth authentication via browser
 */
async function authenticate(): Promise<TokenData> {
  const port = await findAvailablePort();
  const state = generateState();
  const redirectUri = `http://127.0.0.1:${port}`;
  const authUrl = `${API_BASE}/v1/auth/cli?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  console.log("\n🔐 Opening browser for sign-in...");
  console.log("   Sign in with your Google or Apple account.\n");

  // Start callback server first
  const authPromise = startCallbackServer(port, state);

  // Open browser
  await openBrowser(authUrl);

  // Wait for callback
  console.log("⏳ Waiting for authentication (3 minute timeout)...\n");
  const result = await authPromise;

  // Check for errors
  if (result.error) {
    throw new Error(`Authentication failed: ${result.error}`);
  }

  if (!result.access_token) {
    throw new Error("No access token received");
  }

  // Validate CSRF state
  if (result.state !== state) {
    throw new Error("CSRF state mismatch - possible security issue");
  }

  // Calculate expiration
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + (result.expires_in || 3600) - 60; // Subtract 60s buffer

  return {
    access_token: result.access_token,
    refresh_token: result.refresh_token || "",
    expires_at: expiresAt,
  };
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
      console.log(`📊 Plan: ${subscription.plan?.type || "Unknown"} (${subscription.status})`);
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
        const overwrite = await prompt(rl, "Do you want to overwrite it? (yes/no): ");

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
📋 Authentication Flow:
═══════════════════════════════════════════════════════════════

1️⃣  I'll open the KallyAI sign-in page in your browser
2️⃣  Sign in with your Google or Apple account
3️⃣  Tokens will be saved automatically

Press Enter to continue...
`);

    await prompt(rl, "");
    rl.close();

    // Perform OAuth authentication
    const tokenData = await authenticate();

    console.log("\n🔍 Verifying token...");

    // Verify token works
    const isValid = await verifyToken(tokenData.access_token);

    if (!isValid) {
      console.log(`
❌ Token verification failed. Please try again.

Run: npx kallyai-mcp-server --setup
`);
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
  } catch (error) {
    rl.close();
    if (error instanceof Error) {
      console.error(`\n❌ Setup failed: ${error.message}`);
    } else {
      console.error("\n❌ Setup failed with unexpected error:", error);
    }
    console.log("\nPlease try again or contact support@kallyintelligence.com");
    process.exit(1);
  }
}

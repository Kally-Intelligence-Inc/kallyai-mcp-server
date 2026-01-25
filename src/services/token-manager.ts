/**
 * Token manager for KallyAI MCP Server
 * Reads and manages OAuth tokens from ~/.kallyai_token.json
 * Same approach as kallyai-cli
 */

import { readFile, writeFile, stat } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import axios from "axios";
import { z } from "zod";
import { API_BASE_URL } from "../constants.js";

const TOKEN_FILE = join(homedir(), ".kallyai_token.json");

// Mutex lock to prevent concurrent token refresh attempts
let refreshPromise: Promise<TokenData> | null = null;

const TokenDataSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  expires_at: z.number().int().positive(),
});

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/**
 * Read token data from ~/.kallyai_token.json
 */
async function readTokenFile(): Promise<TokenData | null> {
  try {
    const content = await readFile(TOKEN_FILE, "utf-8");

    // Verify file permissions for security
    const stats = await stat(TOKEN_FILE);
    const mode = stats.mode & parseInt('777', 8);
    if (mode !== parseInt('600', 8)) {
      throw new Error(
        `Token file has insecure permissions (${mode.toString(8)}). ` +
        `Please run: chmod 600 ${TOKEN_FILE}`
      );
    }

    const data = JSON.parse(content);

    // Validate the token data structure
    const validatedData = TokenDataSchema.parse(data);
    return validatedData;
  } catch (error) {
    // File doesn't exist, can't be read, or validation failed
    return null;
  }
}

/**
 * Write token data to ~/.kallyai_token.json
 */
async function writeTokenFile(data: TokenData): Promise<void> {
  const content = JSON.stringify(data);
  await writeFile(TOKEN_FILE, content, { mode: 0o600 }); // Read/write for owner only
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshToken(refreshToken: string): Promise<TokenData> {
  try {
    const response = await axios.post<RefreshResponse>(
      `${API_BASE_URL}/auth/refresh`,
      { refresh_token: refreshToken },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    const now = Math.floor(Date.now() / 1000);
    const newTokenData: TokenData = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_at: now + response.data.expires_in,
    };

    // Save refreshed tokens
    await writeTokenFile(newTokenData);

    return newTokenData;
  } catch (error) {
    throw new Error(
      `❌ Failed to refresh authentication token.\n\n` +
      `Please re-authenticate:\n` +
      `  1️⃣  Run: npx kallyai-mcp-server --setup\n` +
      `  2️⃣  Visit: https://kallyai.com/app`
    );
  }
}

/**
 * Get a valid access token, refreshing if necessary
 * Throws an error if no token is available or refresh fails
 */
export async function getAccessToken(): Promise<string> {
  const tokenData = await readTokenFile();

  if (!tokenData) {
    throw new Error(
      `🔐 Welcome to KallyAI MCP Server!\n\n` +
      `To get started, you need to authenticate first.\n\n` +
      `Choose one of these options:\n` +
      `  1️⃣  Run: npx kallyai-mcp-server --setup\n` +
      `  2️⃣  Visit: https://kallyai.com/app\n\n` +
      `This will create your authentication token at: ${TOKEN_FILE}`
    );
  }

  // Check if token is expired (with 60 second buffer)
  const now = Math.floor(Date.now() / 1000);
  const isExpired = tokenData.expires_at - now < 60;

  if (isExpired) {
    // Check if a refresh is already in progress
    if (refreshPromise) {
      const refreshedData = await refreshPromise;
      return refreshedData.access_token;
    }

    // Attempt to refresh the token
    try {
      refreshPromise = refreshToken(tokenData.refresh_token);
      const refreshedData = await refreshPromise;
      return refreshedData.access_token;
    } catch (error) {
      throw new Error(
        `🔄 Your session has expired and couldn't be refreshed automatically.\n\n` +
        `Please re-authenticate:\n` +
        `  1️⃣  Run: npx kallyai-mcp-server --setup\n` +
        `  2️⃣  Visit: https://kallyai.com/app\n\n` +
        `Error details: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      refreshPromise = null;
    }
  }

  return tokenData.access_token;
}

/**
 * Check if user is authenticated (has valid token file)
 */
export async function isAuthenticated(): Promise<boolean> {
  const tokenData = await readTokenFile();
  return tokenData !== null;
}

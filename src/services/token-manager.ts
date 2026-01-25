/**
 * Token manager for KallyAI MCP Server
 * Reads and manages OAuth tokens from ~/.kallyai_token.json
 * Same approach as kallyai-cli
 */

import { readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import axios from "axios";
import { API_BASE_URL } from "../constants.js";

const TOKEN_FILE = join(homedir(), ".kallyai_token.json");

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
    const data = JSON.parse(content);
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    };
  } catch (error) {
    // File doesn't exist or can't be read
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
      `Failed to refresh token. Please authenticate again by running: kallyai login`
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
      `No authentication found. Please authenticate first by running: kallyai login\n` +
      `Or visit https://kallyai.com/app to sign in.`
    );
  }

  // Check if token is expired (with 60 second buffer)
  const now = Math.floor(Date.now() / 1000);
  const isExpired = tokenData.expires_at - now < 60;

  if (isExpired) {
    // Attempt to refresh the token
    try {
      const refreshedData = await refreshToken(tokenData.refresh_token);
      return refreshedData.access_token;
    } catch (error) {
      throw new Error(
        `Access token expired and refresh failed. Please authenticate again by running: kallyai login\n` +
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
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

/**
 * Constants for KallyAI MCP Server
 */

export const API_BASE_URL = "https://api.kallyai.com/v1";
export const CHARACTER_LIMIT = 25000;

export enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

export enum TaskCategory {
  RESTAURANT = "restaurant",
  CLINIC = "clinic",
  HOTEL = "hotel",
  GENERAL = "general"
}

export enum CallStatus {
  SUCCESS = "success",
  NO_ANSWER = "no_answer",
  BUSY = "busy",
  FAILED = "failed",
  VOICEMAIL = "voicemail",
  CANCELLED = "cancelled"
}

export enum Language {
  EN = "en",
  ES = "es"
}

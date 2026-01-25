/**
 * Shared API client for KallyAI API requests
 */

import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../constants.js";
import type { ErrorResponse } from "../types.js";

/**
 * Make an authenticated API request to KallyAI
 */
export async function makeApiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: unknown,
  params?: Record<string, unknown>,
  accessToken?: string
): Promise<T> {
  const config: AxiosRequestConfig = {
    method,
    url: `${API_BASE_URL}/${endpoint}`,
    timeout: 120000, // 2 minutes for calls to complete
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "ChatGPT-User KallyAI-MCP/1.0",
    },
  };

  if (accessToken) {
    config.headers!["Authorization"] = `Bearer ${accessToken}`;
  }

  if (data !== undefined) {
    config.data = data;
  }

  if (params !== undefined) {
    config.params = params;
  }

  try {
    const response = await axios(config);
    return response.data as T;
  } catch (error) {
    throw error;
  }
}

/**
 * Handle API errors and return user-friendly messages
 */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;

    if (axiosError.response) {
      const status = axiosError.response.status;
      const errorData = axiosError.response.data;

      // Handle structured error responses
      if (errorData && typeof errorData === 'object' && 'error' in errorData) {
        const errorDetails = errorData.error;
        const code = errorDetails.code;
        const message = errorDetails.details?.message || "Unknown error";

        switch (code) {
          case "quota_exceeded":
            return `Error: Quota exceeded. ${message}. Please upgrade at https://kallyai.com/pricing`;
          case "missing_phone_number":
            return `Error: ${message}. Please provide a valid phone number in E.164 format (+1234567890)`;
          case "emergency_number":
            return `Error: ${message}. Emergency numbers (911, 112, etc.) cannot be called`;
          case "toll_number":
            return `Error: ${message}. Premium rate numbers are not supported`;
          case "blocked_number":
            return `Error: ${message}. This number has been flagged and cannot be called`;
          case "safety_violation":
            return `Error: ${message}. The request violates safety guidelines`;
          case "country_restriction":
            return `Error: ${message}. This country is not supported in your region`;
          case "unsupported_country":
            return `Error: ${message}. This country is not currently supported`;
          case "unsupported_language":
            return `Error: ${message}. Supported languages are English (en) and Spanish (es)`;
          case "missing_token":
            return `Error: Authentication required. Please provide a valid access token`;
          case "forbidden":
            return `Error: ${message}. You don't have permission to access this resource`;
          case "call_not_found":
            return `Error: ${message}. The call ID does not exist or you don't have access to it`;
          case "transcript_not_found":
            return `Error: ${message}. No transcript is available for this call yet`;
          default:
            return `Error: ${message}`;
        }
      }

      // Handle HTTP status codes without structured errors
      switch (status) {
        case 400:
          return "Error: Bad request. Please check your input parameters";
        case 401:
          return "Error: Unauthorized. Please provide a valid access token";
        case 402:
          return "Error: Payment required. You've exceeded your quota. Upgrade at https://kallyai.com/pricing";
        case 403:
          return "Error: Forbidden. You don't have permission to perform this action";
        case 404:
          return "Error: Resource not found. Please check the ID is correct";
        case 422:
          return "Error: Validation failed. Please check your input parameters";
        case 429:
          return "Error: Rate limit exceeded. Please wait before making more requests";
        case 500:
          return "Error: Internal server error. Please try again later";
        case 503:
          return "Error: Service temporarily unavailable. Please try again later";
        default:
          return `Error: API request failed with status ${status}`;
      }
    } else if (axiosError.code === "ECONNABORTED") {
      return "Error: Request timed out. Please try again";
    } else if (axiosError.code === "ENOTFOUND") {
      return "Error: Could not connect to KallyAI API. Please check your internet connection";
    } else if (axiosError.code === "ECONNREFUSED") {
      return "Error: Connection refused. The KallyAI service may be down";
    }
  }

  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }

  return `Error: An unexpected error occurred: ${String(error)}`;
}

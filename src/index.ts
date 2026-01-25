#!/usr/bin/env node
/**
 * KallyAI MCP Server
 *
 * MCP server for KallyAI API - an AI phone assistant that makes calls on your behalf.
 * Supports restaurant reservations, medical appointments, hotel bookings, and general inquiries.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

// Import schemas
import {
  CreateCallSchema,
  ListCallsSchema,
  GetCallSchema,
  GetTranscriptSchema,
  GetSubscriptionSchema,
  GetStatisticsSchema,
} from "./schemas/index.js";

// Import tool implementations
import { createCall, listCalls, getCall, getTranscript } from "./tools/calls.js";
import { getSubscription, getStatistics } from "./tools/user.js";

// Create MCP server instance
const server = new McpServer({
  name: "kallyai-mcp-server",
  version: "1.0.0",
});

/**
 * Tool: kallyai_create_call
 * Make an AI phone call to accomplish a task
 */
server.registerTool(
  "kallyai_create_call",
  {
    title: "Create KallyAI Phone Call",
    description: `Make an AI phone call to a business to accomplish a task such as making a reservation, scheduling an appointment, or asking questions.

This tool creates a phone call where an AI assistant will speak with a human at the specified phone number to complete the requested task. The AI can handle restaurant reservations, medical appointments, hotel bookings, and general inquiries.

Args:
  - task_category (enum): Type of call - 'restaurant', 'clinic', 'hotel', or 'general'
  - task_description (string): What the AI should accomplish (10-1000 characters)
  - respondent_phone (string): Phone number to call in E.164 format (e.g., +14155551234)
  - business_name (string, optional): Name of the business
  - user_name (string, optional): Name for the reservation/appointment
  - user_phone (string, optional): User's callback number in E.164 format
  - appointment_date (string, optional): Date in YYYY-MM-DD format
  - appointment_time (string, optional): Time in HH:MM 24-hour format
  - time_preference_text (string, optional): Natural language time preference (e.g., "morning")
  - party_size (number, optional): Number of people for restaurant (1-50)
  - language (enum, optional): App language - 'en' or 'es' (default: 'en')
  - call_language (enum, optional): Call language - 'en' or 'es' (default: 'en')
  - timezone (string, optional): Timezone (default: 'America/New_York')
  - is_urgent (boolean, optional): Prioritize the call (default: false)
  - additional_instructions (array, optional): Extra instructions for AI
  - response_format (enum, optional): 'markdown' or 'json' (default: 'markdown')

Note: Authentication is handled automatically using tokens from ~/.kallyai_token.json

Returns:
  For JSON format: Structured data with schema:
  {
    "call_id": string,           // Unique call identifier (UUID)
    "status": string,            // 'success', 'no_answer', 'busy', 'failed', 'voicemail', 'cancelled'
    "highlights": string,        // Summary of what was accomplished
    "next_steps": string,        // Follow-up actions needed
    "duration_seconds": number,  // Call duration
    "metadata": {
      "created_at": string,      // ISO timestamp
      "ended_at": string         // ISO timestamp
    }
  }

Examples:
  - Restaurant reservation: task_category='restaurant', task_description='Reserve table for 4 at 7pm', respondent_phone='+14155551234', party_size=4, appointment_date='2026-01-28', appointment_time='19:00'
  - Medical appointment: task_category='clinic', task_description='Schedule dental checkup', respondent_phone='+14155551234', time_preference_text='morning before 11am'
  - General inquiry: task_category='general', task_description='Ask if they have iPhone 15 in stock and the price', respondent_phone='+14155551234'

Error Handling:
  - Returns quota_exceeded (402) if user is out of minutes - suggests upgrade
  - Returns missing_phone_number (422) if phone is invalid
  - Returns emergency_number (422) if trying to call 911/emergency services
  - Returns country_restriction (403) if country not supported`,
    inputSchema: CreateCallSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  createCall
);

/**
 * Tool: kallyai_list_calls
 * List call history with pagination
 */
server.registerTool(
  "kallyai_list_calls",
  {
    title: "List KallyAI Call History",
    description: `Retrieve a paginated list of previous phone calls made through KallyAI.

This tool returns a history of all calls made by the authenticated user, including their status, business information, and creation timestamps.

Args:
  - limit (number, optional): Maximum results to return (1-200, default: 50)
  - offset (number, optional): Number of results to skip (default: 0)
  - response_format (enum, optional): 'markdown' or 'json' (default: 'markdown')

Note: Authentication is handled automatically using tokens from ~/.kallyai_token.json

Returns:
  For JSON format: Structured data with schema:
  {
    "total": number,             // Total number of calls
    "count": number,             // Number in this response
    "offset": number,            // Current pagination offset
    "items": [
      {
        "call_id": string,       // Call UUID
        "status": string,        // Call status
        "to": string,            // Phone number called
        "business_name": string, // Business name (if provided)
        "created_at": string     // ISO timestamp
      }
    ],
    "has_more": boolean,         // More results available
    "next_offset": number        // Offset for next page (if has_more)
  }

Examples:
  - First page: limit=50, offset=0
  - Second page: limit=50, offset=50
  - Get recent 10 calls: limit=10, offset=0

Error Handling:
  - Returns 401 if authentication token is invalid or expired (run: kallyai login)
  - Automatically truncates if response exceeds character limit`,
    inputSchema: ListCallsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  listCalls
);

/**
 * Tool: kallyai_get_call
 * Get detailed information about a specific call
 */
server.registerTool(
  "kallyai_get_call",
  {
    title: "Get KallyAI Call Details",
    description: `Retrieve detailed information about a specific phone call by its ID.

This tool returns comprehensive information about a call including status, duration, highlights, and next steps.

Args:
  - call_id (string): Unique call identifier (UUID)
  - response_format (enum, optional): 'markdown' or 'json' (default: 'markdown')

Note: Authentication is handled automatically using tokens from ~/.kallyai_token.json

Returns:
  For JSON format: Structured data with schema:
  {
    "call_id": string,
    "status": string,
    "to": string,
    "business_name": string,
    "result_summary": string,
    "highlights": string,
    "next_steps": string,
    "duration_seconds": number,
    "created_at": string,
    "ended_at": string
  }

Examples:
  - Get call details: call_id='123e4567-e89b-12d3-a456-426614174000'

Error Handling:
  - Returns call_not_found (404) if call doesn't exist or user doesn't have access
  - Returns 401 if authentication token is invalid (run: kallyai login)`,
    inputSchema: GetCallSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  getCall
);

/**
 * Tool: kallyai_get_transcript
 * Get conversation transcript for a call
 */
server.registerTool(
  "kallyai_get_transcript",
  {
    title: "Get KallyAI Call Transcript",
    description: `Retrieve the conversation transcript for a specific call.

This tool returns a timestamped transcript of the conversation between the AI assistant and the human, showing who said what and when.

Args:
  - call_id (string): Unique call identifier (UUID)
  - response_format (enum, optional): 'markdown' or 'json' (default: 'markdown')

Note: Authentication is handled automatically using tokens from ~/.kallyai_token.json

Returns:
  For JSON format: Structured data with schema:
  {
    "entries": [
      {
        "speaker": string,      // 'AI' or 'HUMAN'
        "content": string,      // What was said
        "timestamp": string     // Timestamp in HH:MM:SS format
      }
    ]
  }

Examples:
  - Get transcript: call_id='123e4567-e89b-12d3-a456-426614174000'

Error Handling:
  - Returns transcript_not_found (404) if no transcript is available yet
  - Returns call_not_found (404) if call doesn't exist
  - Returns 401 if authentication token is invalid (run: kallyai login)`,
    inputSchema: GetTranscriptSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  getTranscript
);

/**
 * Tool: kallyai_get_subscription
 * Get subscription status and plan details
 */
server.registerTool(
  "kallyai_get_subscription",
  {
    title: "Get KallyAI Subscription Status",
    description: `Retrieve the authenticated user's subscription status and plan details.

This tool returns information about the user's current subscription including plan type, minutes included, expiration date, and management URL.

Args:
  - response_format (enum, optional): 'markdown' or 'json' (default: 'markdown')

Note: Authentication is handled automatically using tokens from ~/.kallyai_token.json

Returns:
  For JSON format: Structured data with schema:
  {
    "has_active_subscription": boolean,
    "provider": string,          // 'stripe', 'apple', or 'google'
    "plan": {
      "type": string,           // 'trial', 'personal', 'business'
      "period": string,         // 'monthly' or 'annual'
      "minutes_included": number
    },
    "status": string,           // 'active', 'cancelled', 'expired'
    "expires_at": string,       // ISO timestamp
    "auto_renew": boolean,
    "management_url": string    // URL to manage subscription
  }

Error Handling:
  - Returns 401 if authentication token is invalid or expired (run: kallyai login)`,
    inputSchema: GetSubscriptionSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  getSubscription
);

/**
 * Tool: kallyai_get_statistics
 * Get usage statistics and quota information
 */
server.registerTool(
  "kallyai_get_statistics",
  {
    title: "Get KallyAI Usage Statistics",
    description: `Retrieve usage statistics including minutes used, calls made, and remaining quota.

This tool returns detailed usage information for the current billing period including allocated vs used minutes and calls.

Args:
  - response_format (enum, optional): 'markdown' or 'json' (default: 'markdown')

Note: Authentication is handled automatically using tokens from ~/.kallyai_token.json

Returns:
  For JSON format: Structured data with schema:
  {
    "plan_type": string,
    "minutes_allocated": number,
    "minutes_used": number,
    "minutes_remaining": number,
    "calls_allocated": number,
    "calls_used": number,
    "calls_remaining": number,
    "period_start": string,      // ISO timestamp
    "period_end": string,        // ISO timestamp
    "usage_percentage": number,  // Percentage of quota used
    "subscription_status": string
  }

Error Handling:
  - Returns 401 if authentication token is invalid or expired (run: kallyai login)`,
    inputSchema: GetStatisticsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  getStatistics
);

/**
 * Run server with stdio transport (local)
 */
async function runStdio() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("KallyAI MCP server running via stdio");
}

/**
 * Run server with HTTP transport (remote)
 */
async function runHTTP() {
  const app = express();

  // Configure helmet security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.kallyai.com"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
  }));

  // Configure CORS
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://claude.ai', 'https://www.anthropic.com'],
    credentials: true,
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json());

  // Configure rate limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

  // Apply rate limiter to /mcp endpoint
  app.use('/mcp', limiter);

  app.post("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on("close", () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const port = parseInt(process.env.PORT || "3000");
  app.listen(port, () => {
    console.error(`KallyAI MCP server running on http://localhost:${port}/mcp`);
  });
}

/**
 * Main entry point
 */
const transport = process.env.TRANSPORT || "stdio";
if (transport === "http") {
  runHTTP().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
} else {
  runStdio().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}

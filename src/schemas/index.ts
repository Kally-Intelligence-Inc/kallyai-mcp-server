/**
 * Zod validation schemas for KallyAI MCP tools
 */

import { z } from "zod";
import { ResponseFormat, TaskCategory, Language } from "../constants.js";

// Reusable schema components
export const PaginationSchema = z.object({
  limit: z.number()
    .int()
    .min(1)
    .max(200)
    .default(50)
    .describe("Maximum number of results to return (1-200)"),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe("Number of results to skip for pagination"),
}).strict();

export const ResponseFormatSchema = z.object({
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable"),
}).strict();

// Create Call Schema
export const CreateCallSchema = z.object({
  task_category: z.nativeEnum(TaskCategory)
    .describe("Category of the call: 'restaurant' for dining reservations, 'clinic' for medical appointments, 'hotel' for hotel bookings, or 'general' for other tasks"),
  task_description: z.string()
    .min(10, "Task description must be at least 10 characters")
    .max(1000, "Task description must not exceed 1000 characters")
    .describe("What the AI should accomplish during the call"),
  respondent_phone: z.string()
    .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g., +1234567890)")
    .describe("Phone number to call in E.164 format (+1234567890)"),
  business_name: z.string()
    .max(200)
    .optional()
    .describe("Name of the business being called"),
  user_name: z.string()
    .max(100)
    .optional()
    .describe("Name to use for the reservation or appointment"),
  user_phone: z.string()
    .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format")
    .optional()
    .describe("User's callback phone number in E.164 format"),
  appointment_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional()
    .describe("Appointment date in YYYY-MM-DD format"),
  appointment_time: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:MM 24-hour format")
    .optional()
    .describe("Appointment time in HH:MM 24-hour format (e.g., 14:30)"),
  time_preference_text: z.string()
    .max(200)
    .optional()
    .describe("Natural language time preference (e.g., 'morning', 'after 5pm', 'weekday afternoons')"),
  party_size: z.number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe("Number of people for restaurant reservations (1-50)"),
  language: z.nativeEnum(Language)
    .default(Language.EN)
    .describe("App interface language: 'en' for English or 'es' for Spanish"),
  call_language: z.nativeEnum(Language)
    .default(Language.EN)
    .describe("Language for the phone conversation: 'en' for English or 'es' for Spanish"),
  timezone: z.string()
    .default("America/New_York")
    .describe("Timezone for the call (e.g., 'America/New_York', 'Europe/Madrid')"),
  is_urgent: z.boolean()
    .default(false)
    .optional()
    .describe("Whether to prioritize this call"),
  additional_instructions: z.array(z.string())
    .optional()
    .describe("Extra instructions for the AI assistant"),
}).merge(ResponseFormatSchema).strict();

export type CreateCallInput = z.infer<typeof CreateCallSchema>;

// List Calls Schema
export const ListCallsSchema = PaginationSchema
  .merge(ResponseFormatSchema)
  .strict();

export type ListCallsInput = z.infer<typeof ListCallsSchema>;

// Get Call Schema
export const GetCallSchema = z.object({
  call_id: z.string()
    .uuid("Call ID must be a valid UUID")
    .describe("Unique identifier for the call"),
}).merge(ResponseFormatSchema).strict();

export type GetCallInput = z.infer<typeof GetCallSchema>;

// Get Transcript Schema
export const GetTranscriptSchema = z.object({
  call_id: z.string()
    .uuid("Call ID must be a valid UUID")
    .describe("Unique identifier for the call"),
}).merge(ResponseFormatSchema).strict();

export type GetTranscriptInput = z.infer<typeof GetTranscriptSchema>;

// Get Subscription Schema
export const GetSubscriptionSchema = ResponseFormatSchema.strict();

export type GetSubscriptionInput = z.infer<typeof GetSubscriptionSchema>;

// Get Statistics Schema
export const GetStatisticsSchema = ResponseFormatSchema.strict();

export type GetStatisticsInput = z.infer<typeof GetStatisticsSchema>;

/**
 * TypeScript type definitions for KallyAI API
 */

import { CallStatus, TaskCategory, Language } from "./constants.js";

export interface SubmissionPayload {
  task_category: TaskCategory;
  task_description: string;
  respondent_phone: string;
  business_name?: string;
  user_name?: string;
  user_phone?: string;
  appointment_date?: string;
  appointment_time?: string;
  time_preference_text?: string;
  party_size?: number;
  language?: Language;
  call_language?: Language;
  is_urgent?: boolean;
  additional_instructions?: string[];
}

export interface CallCreateRequest {
  submission: SubmissionPayload;
  timezone: string;
  session_id?: string;
}

export interface CallResponse {
  [key: string]: unknown;
  call_id: string;
  status: CallStatus;
  highlights?: string;
  next_steps?: string;
  duration_seconds?: number;
  metadata?: {
    created_at: string;
    ended_at?: string;
  };
  submission?: SubmissionPayload;
  to?: string;
  business_name?: string;
  result_summary?: string;
  created_at?: string;
  ended_at?: string;
}

export interface CallListResponse {
  [key: string]: unknown;
  items: CallResponse[];
  total: number;
}

export interface TranscriptEntry {
  [key: string]: unknown;
  speaker: "AI" | "HUMAN";
  content: string;
  timestamp: string;
}

export interface TranscriptResponse {
  [key: string]: unknown;
  entries: TranscriptEntry[];
}

export interface SubscriptionPlan {
  [key: string]: unknown;
  type: string;
  period: string;
  minutes_included: number;
}

export interface SubscriptionResponse {
  [key: string]: unknown;
  has_active_subscription: boolean;
  provider?: string;
  plan?: SubscriptionPlan;
  status: string;
  expires_at?: string;
  auto_renew?: boolean;
  management_url?: string;
}

export interface StatisticsResponse {
  [key: string]: unknown;
  plan_type: string;
  minutes_allocated: number;
  minutes_used: number;
  minutes_remaining: number;
  calls_allocated: number;
  calls_used: number;
  calls_remaining: number;
  period_start: string;
  period_end: string;
  usage_percentage: number;
  subscription_status: string;
}

export interface QuotaExceededResponse {
  plan_type: string;
  minutes_allocated: number;
  minutes_used: number;
  upgrade_url: string;
}

export interface ErrorResponse {
  error: {
    code: string;
    details: {
      message: string;
      reason?: string;
    };
    correlation_id?: string;
  };
}

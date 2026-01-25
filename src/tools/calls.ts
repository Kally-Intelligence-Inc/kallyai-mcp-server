/**
 * Call management tools for KallyAI MCP server
 */

import { makeApiRequest, handleApiError } from "../services/api-client.js";
import { getAccessToken } from "../services/token-manager.js";
import { ResponseFormat, CHARACTER_LIMIT } from "../constants.js";
import type {
  CallCreateRequest,
  CallResponse,
  CallListResponse,
  TranscriptResponse,
} from "../types.js";
import type {
  CreateCallInput,
  ListCallsInput,
  GetCallInput,
  GetTranscriptInput,
} from "../schemas/index.js";

/**
 * Format call response as markdown
 */
function formatCallMarkdown(call: CallResponse): string {
  const lines: string[] = [
    `# Call ${call.call_id}`,
    "",
    `**Status**: ${call.status}`,
  ];

  if (call.to) {
    lines.push(`**To**: ${call.to}`);
  }

  if (call.business_name) {
    lines.push(`**Business**: ${call.business_name}`);
  }

  if (call.highlights || call.result_summary) {
    lines.push("", "## Summary", "");
    lines.push(call.highlights || call.result_summary || "");
  }

  if (call.next_steps) {
    lines.push("", "## Next Steps", "");
    lines.push(call.next_steps);
  }

  if (call.duration_seconds) {
    const minutes = Math.floor(call.duration_seconds / 60);
    const seconds = Math.floor(call.duration_seconds % 60);
    lines.push("", `**Duration**: ${minutes}m ${seconds}s`);
  }

  if (call.created_at || call.metadata?.created_at) {
    const createdAt = call.created_at || call.metadata?.created_at;
    lines.push(`**Created**: ${createdAt}`);
  }

  if (call.ended_at || call.metadata?.ended_at) {
    const endedAt = call.ended_at || call.metadata?.ended_at;
    lines.push(`**Ended**: ${endedAt}`);
  }

  return lines.join("\n");
}

/**
 * Format call list as markdown
 */
function formatCallListMarkdown(calls: CallResponse[], total: number): string {
  const lines: string[] = [
    `# Call History`,
    "",
    `Total calls: ${total}`,
    `Showing: ${calls.length}`,
    "",
  ];

  for (const call of calls) {
    lines.push(`## ${call.call_id}`);
    lines.push(`- **Status**: ${call.status}`);
    if (call.to) {
      lines.push(`- **To**: ${call.to}`);
    }
    if (call.business_name) {
      lines.push(`- **Business**: ${call.business_name}`);
    }
    if (call.created_at) {
      lines.push(`- **Created**: ${call.created_at}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Format transcript as markdown
 */
function formatTranscriptMarkdown(transcript: TranscriptResponse): string {
  const lines: string[] = [
    "# Call Transcript",
    "",
  ];

  for (const entry of transcript.entries) {
    lines.push(`**[${entry.timestamp}] ${entry.speaker}**: ${entry.content}`);
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Create a phone call
 */
export async function createCall(params: CreateCallInput) {
  try {
    const accessToken = await getAccessToken();
    const { response_format, timezone, ...submissionFields } = params;

    const requestBody: CallCreateRequest = {
      submission: {
        task_category: submissionFields.task_category,
        task_description: submissionFields.task_description,
        respondent_phone: submissionFields.respondent_phone,
        ...(submissionFields.business_name && { business_name: submissionFields.business_name }),
        ...(submissionFields.user_name && { user_name: submissionFields.user_name }),
        ...(submissionFields.user_phone && { user_phone: submissionFields.user_phone }),
        ...(submissionFields.appointment_date && { appointment_date: submissionFields.appointment_date }),
        ...(submissionFields.appointment_time && { appointment_time: submissionFields.appointment_time }),
        ...(submissionFields.time_preference_text && { time_preference_text: submissionFields.time_preference_text }),
        ...(submissionFields.party_size && { party_size: submissionFields.party_size }),
        language: submissionFields.language,
        call_language: submissionFields.call_language,
        ...(submissionFields.is_urgent && { is_urgent: submissionFields.is_urgent }),
        ...(submissionFields.additional_instructions && { additional_instructions: submissionFields.additional_instructions }),
      },
      timezone,
    };

    const callResponse = await makeApiRequest<CallResponse>(
      "calls",
      "POST",
      requestBody,
      undefined,
      accessToken
    );

    let textContent: string;
    if (response_format === ResponseFormat.MARKDOWN) {
      textContent = formatCallMarkdown(callResponse);
    } else {
      textContent = JSON.stringify(callResponse, null, 2);
    }

    return {
      content: [{ type: "text" as const, text: textContent }],
      structuredContent: callResponse,
    };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: handleApiError(error) }],
    };
  }
}

/**
 * List call history
 */
export async function listCalls(params: ListCallsInput) {
  try {
    const accessToken = await getAccessToken();
    const { response_format, limit, offset } = params;

    const response = await makeApiRequest<CallListResponse>(
      "calls",
      "GET",
      undefined,
      { limit, offset },
      accessToken
    );

    const output = {
      total: response.total,
      count: response.items.length,
      offset,
      items: response.items,
      has_more: response.total > offset + response.items.length,
      ...(response.total > offset + response.items.length && {
        next_offset: offset + response.items.length,
      }),
    };

    let textContent: string;
    if (response_format === ResponseFormat.MARKDOWN) {
      textContent = formatCallListMarkdown(response.items, response.total);
    } else {
      textContent = JSON.stringify(output, null, 2);
    }

    // Check character limit
    if (textContent.length > CHARACTER_LIMIT) {
      const truncatedItems = response.items.slice(0, Math.max(1, Math.floor(response.items.length / 2)));
      const truncatedOutput = {
        ...output,
        items: truncatedItems,
        count: truncatedItems.length,
        truncated: true,
        truncation_message: `Response truncated from ${response.items.length} to ${truncatedItems.length} items. Use 'offset' parameter to see more results.`,
      };
      textContent = response_format === ResponseFormat.MARKDOWN
        ? formatCallListMarkdown(truncatedItems, response.total) + "\n\n" + truncatedOutput.truncation_message
        : JSON.stringify(truncatedOutput, null, 2);
    }

    return {
      content: [{ type: "text" as const, text: textContent }],
      structuredContent: output,
    };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: handleApiError(error) }],
    };
  }
}

/**
 * Get call details
 */
export async function getCall(params: GetCallInput) {
  try {
    const accessToken = await getAccessToken();
    const { response_format, call_id } = params;

    const callResponse = await makeApiRequest<CallResponse>(
      `calls/${call_id}`,
      "GET",
      undefined,
      undefined,
      accessToken
    );

    let textContent: string;
    if (response_format === ResponseFormat.MARKDOWN) {
      textContent = formatCallMarkdown(callResponse);
    } else {
      textContent = JSON.stringify(callResponse, null, 2);
    }

    return {
      content: [{ type: "text" as const, text: textContent }],
      structuredContent: callResponse,
    };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: handleApiError(error) }],
    };
  }
}

/**
 * Get call transcript
 */
export async function getTranscript(params: GetTranscriptInput) {
  try {
    const accessToken = await getAccessToken();
    const { response_format, call_id } = params;

    const transcriptResponse = await makeApiRequest<TranscriptResponse>(
      `calls/${call_id}/transcript`,
      "GET",
      undefined,
      undefined,
      accessToken
    );

    let textContent: string;
    if (response_format === ResponseFormat.MARKDOWN) {
      textContent = formatTranscriptMarkdown(transcriptResponse);
    } else {
      textContent = JSON.stringify(transcriptResponse, null, 2);
    }

    return {
      content: [{ type: "text" as const, text: textContent }],
      structuredContent: transcriptResponse,
    };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: handleApiError(error) }],
    };
  }
}

/**
 * User management tools for KallyAI MCP server
 */

import { makeApiRequest, handleApiError } from "../services/api-client.js";
import { getAccessToken } from "../services/token-manager.js";
import { ResponseFormat } from "../constants.js";
import type {
  SubscriptionResponse,
  StatisticsResponse,
} from "../types.js";
import type {
  GetSubscriptionInput,
  GetStatisticsInput,
} from "../schemas/index.js";

/**
 * Format subscription as markdown
 */
function formatSubscriptionMarkdown(sub: SubscriptionResponse): string {
  const lines: string[] = [
    "# Subscription Status",
    "",
    `**Active**: ${sub.has_active_subscription ? "Yes" : "No"}`,
    `**Status**: ${sub.status}`,
  ];

  if (sub.plan) {
    lines.push("", "## Plan Details", "");
    lines.push(`- **Type**: ${sub.plan.type}`);
    lines.push(`- **Period**: ${sub.plan.period}`);
    lines.push(`- **Minutes Included**: ${sub.plan.minutes_included}`);
  }

  if (sub.provider) {
    lines.push("", `**Provider**: ${sub.provider}`);
  }

  if (sub.expires_at) {
    lines.push(`**Expires**: ${sub.expires_at}`);
  }

  if (sub.auto_renew !== undefined) {
    lines.push(`**Auto-Renew**: ${sub.auto_renew ? "Yes" : "No"}`);
  }

  if (sub.management_url) {
    lines.push("", `[Manage Subscription](${sub.management_url})`);
  }

  return lines.join("\n");
}

/**
 * Format statistics as markdown
 */
function formatStatisticsMarkdown(stats: StatisticsResponse): string {
  const lines: string[] = [
    "# Usage Statistics",
    "",
    `**Plan**: ${stats.plan_type}`,
    `**Period**: ${stats.period_start} to ${stats.period_end}`,
    "",
    "## Minutes",
    "",
    `- **Allocated**: ${stats.minutes_allocated}`,
    `- **Used**: ${stats.minutes_used}`,
    `- **Remaining**: ${stats.minutes_remaining}`,
    "",
    "## Calls",
    "",
    `- **Allocated**: ${stats.calls_allocated}`,
    `- **Used**: ${stats.calls_used}`,
    `- **Remaining**: ${stats.calls_remaining}`,
    "",
    `**Usage**: ${stats.usage_percentage.toFixed(1)}%`,
    `**Subscription Status**: ${stats.subscription_status}`,
  ];

  return lines.join("\n");
}

/**
 * Get subscription status
 */
export async function getSubscription(params: GetSubscriptionInput) {
  try {
    const accessToken = await getAccessToken();
    const { response_format } = params;

    const subscriptionResponse = await makeApiRequest<SubscriptionResponse>(
      "users/me/subscription",
      "GET",
      undefined,
      undefined,
      accessToken
    );

    let textContent: string;
    if (response_format === ResponseFormat.MARKDOWN) {
      textContent = formatSubscriptionMarkdown(subscriptionResponse);
    } else {
      textContent = JSON.stringify(subscriptionResponse, null, 2);
    }

    return {
      content: [{ type: "text" as const, text: textContent }],
      structuredContent: subscriptionResponse,
    };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: handleApiError(error) }],
    };
  }
}

/**
 * Get usage statistics
 */
export async function getStatistics(params: GetStatisticsInput) {
  try {
    const accessToken = await getAccessToken();
    const { response_format } = params;

    const statisticsResponse = await makeApiRequest<StatisticsResponse>(
      "users/me/statistics",
      "GET",
      undefined,
      undefined,
      accessToken
    );

    let textContent: string;
    if (response_format === ResponseFormat.MARKDOWN) {
      textContent = formatStatisticsMarkdown(statisticsResponse);
    } else {
      textContent = JSON.stringify(statisticsResponse, null, 2);
    }

    return {
      content: [{ type: "text" as const, text: textContent }],
      structuredContent: statisticsResponse,
    };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: handleApiError(error) }],
    };
  }
}

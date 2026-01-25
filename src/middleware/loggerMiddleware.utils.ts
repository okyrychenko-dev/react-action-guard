import { MiddlewareBlockerConfig, MiddlewareContext } from "./middleware.types";

export function getActionEmoji(action: string): string {
  switch (action) {
    case "add":
      return "➕";
    case "update":
      return "🔄";
    case "remove":
      return "➖";
    case "timeout":
      return "⏱️";
    case "clear":
      return "🧹";
    case "clear_scope":
      return "🎯";
    default:
      return "❓";
  }
}

function extractConfigDetails(config?: MiddlewareBlockerConfig): Record<string, unknown> {
  if (!config) {
    return {};
  }

  const { scope, reason, priority } = config;

  const details: Record<string, unknown> = {
    scope,
    reason,
  };

  if (priority !== undefined) {
    details.priority = priority;
  }

  return details;
}

export function formatLogData(context: MiddlewareContext): Record<string, unknown> {
  const configDetails = extractConfigDetails(context.config);

  const logData: Record<string, unknown> = {};

  // Add scope for clear_scope action
  if (context.scope !== undefined) {
    logData.scope = context.scope;
  }

  // Add count for clear actions
  if (context.count !== undefined) {
    logData.count = context.count;
  }

  // Add config details
  if (Object.keys(configDetails).length > 0) {
    logData.config = configDetails;
  }

  // Add previous state if present
  if (context.prevState) {
    logData.prevState = extractConfigDetails(context.prevState);
  }

  // Return config details directly if no special fields
  if (Object.keys(logData).length === 0) {
    return configDetails;
  }

  return Object.keys(logData).length === 1 && logData.config ? configDetails : logData;
}

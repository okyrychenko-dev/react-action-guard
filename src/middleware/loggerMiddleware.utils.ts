import { MiddlewareBlockerConfig, MiddlewareContext } from "./middleware.types";

export const getActionEmoji = (action: string): string => {
  switch (action) {
    case "add":
      return "➕";
    case "remove":
      return "➖";
    case "update":
      return "🔄";
    case "cancel":
      return "❌";
    case "timeout":
      return "⏱️";
    default:
      return "❓";
  }
};

const extractConfigDetails = (config?: MiddlewareBlockerConfig): Record<string, unknown> => {
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
};

export const formatLogData = (context: MiddlewareContext): Record<string, unknown> => {
  const configDetails = extractConfigDetails(context.config);

  if (context.prevState) {
    return {
      config: configDetails,
      prevState: extractConfigDetails(context.prevState),
    };
  }

  return configDetails;
};

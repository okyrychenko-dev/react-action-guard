import { AnalyticsEventData } from "./analyticsMiddleware.types";
import { MiddlewareContext } from "./middleware.types";

const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const buildEventData = (context: MiddlewareContext): AnalyticsEventData => {
  const eventData: AnalyticsEventData = {
    blocker_id: context.blockerId,
  };
  const { scope, reason, priority } = context.config ?? {};

  if (scope !== undefined) {
    eventData.scope = Array.isArray(scope) ? scope.join(",") : scope;
  }

  if (reason !== undefined) {
    eventData.reason = reason;
  }

  if (priority !== undefined) {
    eventData.priority = priority;
  }

  return eventData;
};

export const trackGoogleAnalytics = (action: string, eventData: AnalyticsEventData): void => {
  if (window.gtag) {
    window.gtag("event", `ui_blocking_${action}`, eventData);
  }
};

export const trackMixpanel = (action: string, eventData: AnalyticsEventData): void => {
  if (window.mixpanel) {
    const eventName = `UI Blocking ${action.split("_").map(capitalizeFirst).join(" ")}`;

    window.mixpanel.track(eventName, eventData);
  }
};

export const trackAmplitude = (action: string, eventData: AnalyticsEventData): void => {
  if (window.amplitude) {
    const eventName = `UI Blocking ${action.split("_").map(capitalizeFirst).join(" ")}`;

    window.amplitude.track(eventName, eventData);
  }
};

export const trackCustom = (
  trackFn: (event: string, data: AnalyticsEventData) => void,
  action: string,
  eventData: AnalyticsEventData
): void => {
  try {
    trackFn(`ui_blocking_${action}`, eventData);
  } catch {
    // Silently ignore errors in custom tracker
  }
};

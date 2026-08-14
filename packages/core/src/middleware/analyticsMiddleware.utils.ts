import { AnalyticsEventData } from "./analyticsMiddleware.types";
import { MiddlewareContext } from "./middleware.types";

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getAnalyticsWindow(): Window | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window;
}

export function buildEventData(context: MiddlewareContext): AnalyticsEventData {
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
}

export function trackGoogleAnalytics(action: string, eventData: AnalyticsEventData): void {
  const analyticsWindow = getAnalyticsWindow();

  if (analyticsWindow?.gtag) {
    analyticsWindow.gtag("event", `ui_blocking_${action}`, eventData);
  }
}

export function trackMixpanel(action: string, eventData: AnalyticsEventData): void {
  const analyticsWindow = getAnalyticsWindow();

  if (analyticsWindow?.mixpanel) {
    const eventName = `UI Blocking ${action.split("_").map(capitalizeFirst).join(" ")}`;

    analyticsWindow.mixpanel.track(eventName, eventData);
  }
}

export function trackAmplitude(action: string, eventData: AnalyticsEventData): void {
  const analyticsWindow = getAnalyticsWindow();

  if (analyticsWindow?.amplitude) {
    const eventName = `UI Blocking ${action.split("_").map(capitalizeFirst).join(" ")}`;

    analyticsWindow.amplitude.track(eventName, eventData);
  }
}

export function trackCustom(
  trackFn: (event: string, data: AnalyticsEventData) => void,
  action: string,
  eventData: AnalyticsEventData
): void {
  try {
    trackFn(`ui_blocking_${action}`, eventData);
  } catch {
    // Silently ignore errors in custom tracker
  }
}

import { AnalyticsConfig, AnalyticsEventData } from "./analyticsMiddleware.types";
import {
  buildEventData,
  trackAmplitude,
  trackCustom,
  trackGoogleAnalytics,
  trackMixpanel,
} from "./analyticsMiddleware.utils";
import { Middleware, MiddlewareContext } from "./middleware.types";

const trackEvent = (
  config: AnalyticsConfig,
  context: MiddlewareContext,
  eventData: AnalyticsEventData
): void => {
  if ("provider" in config) {
    switch (config.provider) {
      case "ga":
        trackGoogleAnalytics(context.action, eventData);
        return;
      case "mixpanel":
        trackMixpanel(context.action, eventData);
        return;
      case "amplitude":
        trackAmplitude(context.action, eventData);
        return;
    }
  }

  if ("track" in config) {
    trackCustom(config.track, context.action, eventData);
  }
};

export const createAnalyticsMiddleware = (config: AnalyticsConfig): Middleware => {
  return (context) => {
    const eventData = buildEventData(context);

    trackEvent(config, context, eventData);
  };
};

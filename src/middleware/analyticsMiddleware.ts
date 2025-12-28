import { AnalyticsConfig, AnalyticsEventData } from "./analyticsMiddleware.types";
import {
  buildEventData,
  trackAmplitude,
  trackCustom,
  trackGoogleAnalytics,
  trackMixpanel,
} from "./analyticsMiddleware.utils";
import { Middleware, MiddlewareContext } from "./middleware.types";

/**
 * Helper function to track events based on analytics configuration.
 * @internal
 */
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

/**
 * Creates middleware for tracking blocker events to analytics platforms.
 * 
 * Automatically tracks all blocker actions (add, remove, update, timeout, clear)
 * to your analytics platform. Supports Google Analytics, Mixpanel, Amplitude,
 * and custom analytics providers.
 * 
 * Event data includes: blockerId, action, scope, reason, priority, timestamp,
 * and duration (for remove events).
 * 
 * @param config - Analytics configuration specifying provider and credentials
 * 
 * @example
 * Google Analytics integration
 * ```ts
 * import { configureMiddleware, createAnalyticsMiddleware } from '@okyrychenko-dev/react-action-guard';
 * 
 * const analyticsMiddleware = createAnalyticsMiddleware({
 *   provider: 'ga',
 *   trackingId: 'GA-XXXXX-Y'
 * });
 * 
 * configureMiddleware([analyticsMiddleware]);
 * ```
 * 
 * @example
 * Mixpanel integration
 * ```ts
 * const analyticsMiddleware = createAnalyticsMiddleware({
 *   provider: 'mixpanel',
 *   token: 'your_mixpanel_token',
 *   options: {
 *     debug: true
 *   }
 * });
 * 
 * configureMiddleware([analyticsMiddleware]);
 * ```
 * 
 * @example
 * Custom analytics provider
 * ```ts
 * const analyticsMiddleware = createAnalyticsMiddleware({
 *   track: (eventName, eventData) => {
 *     // Send to your custom analytics
 *     myAnalytics.track(eventName, {
 *       ...eventData,
 *       userId: getCurrentUserId()
 *     });
 *   }
 * });
 * ```
 * 
 * @example
 * Amplitude with user properties
 * ```ts
 * const analyticsMiddleware = createAnalyticsMiddleware({
 *   provider: 'amplitude',
 *   apiKey: 'your_amplitude_key',
 *   userId: 'user-123',
 *   userProperties: {
 *     plan: 'premium',
 *     role: 'admin'
 *   }
 * });
 * ```
 * 
 * @see {@link AnalyticsConfig} for configuration options
 * @see {@link configureMiddleware} for registering middleware
 * 
 * @public
 * @since 0.6.0
 */
export const createAnalyticsMiddleware = (config: AnalyticsConfig): Middleware => {
  return (context) => {
    const eventData = buildEventData(context);

    trackEvent(config, context, eventData);
  };
};

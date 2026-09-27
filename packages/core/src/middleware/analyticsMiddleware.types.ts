import type { Optional } from "@okyrychenko-dev/type-utils";
export type AnalyticsEventData = Record<string, Optional<string | number | ReadonlyArray<string>>>;

export type AnalyticsProvider = "ga" | "mixpanel" | "amplitude";

export interface GoogleAnalyticsConfig {
  provider: "ga";
}

export interface MixpanelConfig {
  provider: "mixpanel";
}

export interface AmplitudeConfig {
  provider: "amplitude";
}

export interface CustomAnalyticsConfig {
  track: (event: string, data: AnalyticsEventData) => void;
}

export type AnalyticsConfig =
  GoogleAnalyticsConfig | MixpanelConfig | AmplitudeConfig | CustomAnalyticsConfig;

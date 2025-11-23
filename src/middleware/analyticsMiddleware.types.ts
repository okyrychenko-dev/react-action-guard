export type AnalyticsEventData = Record<
  string,
  string | number | ReadonlyArray<string> | undefined
>;

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
  | GoogleAnalyticsConfig
  | MixpanelConfig
  | AmplitudeConfig
  | CustomAnalyticsConfig;

type AnalyticsEventValue = string | number | boolean | null | undefined;

type AnalyticsEventParams = Record<
  string,
  AnalyticsEventValue | ReadonlyArray<AnalyticsEventValue> | Array<AnalyticsEventValue>
>;

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, eventParams?: AnalyticsEventParams) => void;
    mixpanel?: {
      track: (eventName: string, properties?: AnalyticsEventParams) => void;
    };
    amplitude?: {
      track: (eventName: string, eventProperties?: AnalyticsEventParams) => void;
    };
  }
}

export {};

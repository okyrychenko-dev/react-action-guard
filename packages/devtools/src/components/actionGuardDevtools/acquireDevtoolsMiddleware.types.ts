import type { DevtoolsStoreApi } from "../../store";

export interface ObservationSessionConfiguration {
  defaultOpen: boolean;
  maxEvents: number;
}

export interface ObservationParticipation {
  updateConfiguration: (configuration: ObservationSessionConfiguration) => void;
  release: VoidFunction;
}

/** A store-specific session. Participation owns its observation and runtime lifetime. */
export interface ObservationSession {
  readonly devtoolsStore: DevtoolsStoreApi;
  participate: (configuration?: ObservationSessionConfiguration) => ObservationParticipation;
}

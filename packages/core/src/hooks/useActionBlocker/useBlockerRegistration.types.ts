import type { BlockerConfig } from "../../store";

export interface UseBlockerRegistrationOptions {
  blockerId: string;
  config: BlockerConfig;
  /** Keep a timed-out episode complete until the activation source resets. */
  endEpisodeOnTimeout?: boolean;
}

export interface UseBlockerRegistrationReturn {
  activate: VoidFunction;
  deactivate: VoidFunction;
}

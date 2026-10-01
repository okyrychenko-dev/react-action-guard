interface BlockedControlTestState {
  isBlocked: boolean;
}
export type GuardedControlTestOptions<TOptions> = Omit<TOptions, "kind"> & BlockedControlTestState;

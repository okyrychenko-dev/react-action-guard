import type { DevtoolsEvent, DevtoolsEventStats, DevtoolsFilter, DevtoolsStore } from "../types";

type ScopeValue = string | ReadonlyArray<string> | undefined;

/** Number of most-frequent scopes surfaced by the stats selector. */
const TOP_SCOPES_LIMIT = 5;

function createMemoizedSelector<TState, TFirstInput, TSecondInput, TResult>(
  selectFirstInput: (state: TState) => TFirstInput,
  selectSecondInput: (state: TState) => TSecondInput,
  compute: (firstInput: TFirstInput, secondInput: TSecondInput) => TResult
): (state: TState) => TResult {
  let hasPreviousResult = false;
  let previousFirstInput: TFirstInput;
  let previousSecondInput: TSecondInput;
  let previousResult: TResult;

  return (state) => {
    const firstInput = selectFirstInput(state);
    const secondInput = selectSecondInput(state);

    if (
      hasPreviousResult &&
      previousFirstInput === firstInput &&
      previousSecondInput === secondInput
    ) {
      return previousResult;
    }

    const result = compute(firstInput, secondInput);

    hasPreviousResult = true;
    previousFirstInput = firstInput;
    previousSecondInput = secondInput;
    previousResult = result;

    return result;
  };
}

function createMemoizedSingleInputSelector<TState, TInput, TResult>(
  selectInput: (state: TState) => TInput,
  compute: (input: TInput) => TResult
): (state: TState) => TResult {
  let hasPreviousResult = false;
  let previousInput: TInput;
  let previousResult: TResult;

  return (state) => {
    const input = selectInput(state);

    if (hasPreviousResult && previousInput === input) {
      return previousResult;
    }

    const result = compute(input);

    hasPreviousResult = true;
    previousInput = input;
    previousResult = result;

    return result;
  };
}

function normalizeScopes(scope: ScopeValue): ReadonlyArray<string> {
  if (!scope) {
    return [];
  }

  if (typeof scope === "string") {
    return [scope];
  }

  return scope;
}

function getEventScopes(event: DevtoolsEvent): ReadonlyArray<string> {
  const configScopes = normalizeScopes(event.config?.scope);
  if (configScopes.length > 0) {
    return configScopes;
  }

  return normalizeScopes(event.scope);
}

function matchesActionFilter(
  event: DevtoolsEvent,
  actions: DevtoolsStore["filter"]["actions"]
): boolean {
  return actions.length === 0 || actions.includes(event.action);
}

function matchesScopeFilter(event: DevtoolsEvent, scopes: Array<string>): boolean {
  if (scopes.length === 0) {
    return true;
  }

  const eventScopes = getEventScopes(event);
  if (eventScopes.length === 0) {
    return false;
  }

  return eventScopes.some((scope) => scopes.includes(scope));
}

function matchesSearchQuery(event: DevtoolsEvent, search: string): boolean {
  if (!search) {
    return true;
  }

  const searchLower = search.toLowerCase();
  const matchesId = event.blockerId.toLowerCase().includes(searchLower);
  const matchesReason = (event.config?.reason ?? "").toLowerCase().includes(searchLower);
  const matchesScope = getEventScopes(event).some((scope) =>
    scope.toLowerCase().includes(searchLower)
  );

  return matchesId || matchesReason || matchesScope;
}

export function matchesEventFilter(event: DevtoolsEvent, filter: DevtoolsFilter): boolean {
  return (
    matchesActionFilter(event, filter.actions) &&
    matchesScopeFilter(event, filter.scopes) &&
    matchesSearchQuery(event, filter.search)
  );
}

/**
 * Selector for filtered events
 */
export const selectFilteredEvents = createMemoizedSelector(
  (state: DevtoolsStore) => state.events,
  (state: DevtoolsStore) => state.filter,
  (events, filter) => events.filter((event) => matchesEventFilter(event, filter))
);

/**
 * Get unique scopes from all events (for filter dropdown)
 */
export const selectUniqueScopes = createMemoizedSingleInputSelector(
  (state: DevtoolsStore) => state.events,
  (events) => {
    const scopes = new Set<string>();

    events.forEach((event) => {
      getEventScopes(event).forEach((scope) => scopes.add(scope));
    });

    return Array.from(scopes).sort();
  }
);

/**
 * Aggregate statistics over the recorded event history (for the Stats tab).
 */
export const selectEventStats = createMemoizedSingleInputSelector(
  (state: DevtoolsStore) => state.events,
  (events): DevtoolsEventStats => {
    const byAction: Record<DevtoolsEvent["action"], number> = {
      add: 0,
      update: 0,
      remove: 0,
      timeout: 0,
      clear: 0,
      clear_scope: 0,
    };
    const scopeCounts = new Map<string, number>();

    let durationSum = 0;
    let durationSampleCount = 0;
    let maxDurationMs = 0;

    events.forEach((event) => {
      byAction[event.action] += 1;

      getEventScopes(event).forEach((scope) => {
        scopeCounts.set(scope, (scopeCounts.get(scope) ?? 0) + 1);
      });

      if (typeof event.duration === "number") {
        durationSum += event.duration;
        durationSampleCount += 1;
        maxDurationMs = Math.max(maxDurationMs, event.duration);
      }
    });

    const topScopes = Array.from(scopeCounts.entries())
      .map(([scope, count]) => ({ scope, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, TOP_SCOPES_LIMIT);

    return {
      total: events.length,
      byAction,
      durationSampleCount,
      averageDurationMs: durationSampleCount === 0 ? 0 : durationSum / durationSampleCount,
      maxDurationMs,
      topScopes,
    };
  }
);

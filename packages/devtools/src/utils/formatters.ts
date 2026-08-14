export type FormattableScope = string | ReadonlyArray<string>;

export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${String(ms)}ms`;
  }

  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }

  return `${(ms / 60000).toFixed(1)}m`;
}

export function formatScope(scope?: FormattableScope): string {
  if (scope === undefined || scope.length === 0) {
    return "global";
  }

  if (typeof scope === "string") {
    return scope;
  }

  return scope.join(", ");
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);

  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatFullTimestamp(timestamp: number): string {
  const date = new Date(timestamp);

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) {
    return `${String(seconds)}s ago`;
  }

  if (seconds < 3600) {
    return `${String(Math.floor(seconds / 60))}m ago`;
  }

  return `${String(Math.floor(seconds / 3600))}h ago`;
}

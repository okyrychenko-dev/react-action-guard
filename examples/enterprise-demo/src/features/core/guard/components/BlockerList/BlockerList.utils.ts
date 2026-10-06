export function formatScope(scope: string | ReadonlyArray<string>): ReadonlyArray<string> {
  if (typeof scope !== "string") {
    return scope;
  }
  return [scope];
}

export function priorityColor(priority: number): "danger" | "warning" | "default" {
  if (priority >= 90) {
    return "danger";
  }
  if (priority >= 70) {
    return "warning";
  }
  return "default";
}

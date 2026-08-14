import type { DevtoolsEvent } from "../types";

/**
 * Serialized payload produced when exporting the devtools timeline.
 */
export interface DevtoolsEventExport {
  /** ISO timestamp of when the export was produced */
  exportedAt: string;
  /** Number of exported events */
  count: number;
  /** The exported events (in display order, newest first) */
  events: ReadonlyArray<DevtoolsEvent>;
}

/**
 * Serialize timeline events into a pretty-printed JSON string.
 *
 * Pure and deterministic for a given `exportedAt`, so it can be unit-tested
 * without mocking the clock.
 *
 * @param events - Events to serialize (typically the filtered timeline)
 * @param exportedAt - ISO timestamp to embed; defaults to the current time
 */
export function serializeEvents(
  events: ReadonlyArray<DevtoolsEvent>,
  exportedAt: string = new Date().toISOString()
): string {
  const payload: DevtoolsEventExport = {
    exportedAt,
    count: events.length,
    events,
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Copy serialized timeline events to the clipboard.
 *
 * @returns `true` when the clipboard write succeeded, `false` otherwise
 * (e.g. missing permissions or unavailable Clipboard API).
 */
export async function copyEventsToClipboard(
  events: ReadonlyArray<DevtoolsEvent>
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(serializeEvents(events));

    return true;
  } catch {
    return false;
  }
}

/**
 * Trigger a browser download of the serialized timeline events as a JSON file.
 *
 * @param events - Events to export
 * @param filename - Download filename; defaults to a timestamped name
 */
export function downloadEventsAsJson(
  events: ReadonlyArray<DevtoolsEvent>,
  filename = `action-guard-events-${String(Date.now())}.json`
): void {
  const blob = new Blob([serializeEvents(events)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Revoke on the next tick: revoking synchronously right after click() can abort the
  // download in some browsers (Safari/Firefox).
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

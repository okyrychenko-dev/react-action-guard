import { performance } from "node:perf_hooks";

export const warmups = 5;
export const sampleCount = 20;

export function summarize(raw) {
  const sorted = [...raw].sort((a, b) => a - b);
  return {
    medianMs: sorted[Math.ceil(sorted.length * 0.5) - 1],
    p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1],
    maximumMs: sorted.at(-1),
  };
}

// Validation and resetting are deliberately outside the timed interval.
export function measure(run, validate = () => {}, reset = () => {}) {
  const rawMs = [];
  for (let index = 0; index < warmups + sampleCount; index++) {
    const start = performance.now();
    run(index);
    const elapsed = performance.now() - start;
    validate(index);
    reset(index);
    if (index >= warmups) rawMs.push(elapsed);
  }
  return { rawMs, ...summarize(rawMs) };
}

export function delayApiResponse(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }

    const timeoutId = window.setTimeout(resolve, ms);

    const handleAbort = (): void => {
      window.clearTimeout(timeoutId);
      reject(createAbortError());
    };

    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

function createAbortError(): Error {
  const error = new Error("The API request was aborted.");
  error.name = "AbortError";
  return error;
}

/**
 * Simulates an async operation with delay and optional failure
 * @param delayMs - Delay in milliseconds
 * @param shouldFail - Whether the operation should fail
 * @returns Promise that resolves or rejects after the delay
 */
export const simulateAsyncOperation = (delayMs: number, shouldFail: boolean): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Simulated error"));
      } else {
        resolve();
      }
    }, delayMs);
  });
};

/**
 * Formats error message in a type-safe way
 * @param error - Error object or unknown
 * @returns Formatted error message
 */
export const formatErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Unknown error";
};

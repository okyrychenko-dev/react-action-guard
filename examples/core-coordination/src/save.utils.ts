export function simulateSave(shouldFail: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Simulated save failure"));

        return;
      }
      resolve();
    }, 1200);
  });
}

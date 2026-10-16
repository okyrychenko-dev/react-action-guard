export function simulateSave(shouldFail: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Save failed. Try again."));

        return;
      }
      resolve();
    }, 1200);
  });
}

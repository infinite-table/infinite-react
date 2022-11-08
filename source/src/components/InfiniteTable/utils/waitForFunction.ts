export async function waitForFunction(
  fn: () => boolean,
  tickTimeout = 10,
  maxTimeout = 300,
) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    function waitFor() {
      const now = Date.now();

      if (now - start > maxTimeout) {
        return reject(false);
      }

      if (!fn()) {
        setTimeout(waitFor, tickTimeout);
        return;
      }

      resolve(true);
    }

    waitFor();
  });
}

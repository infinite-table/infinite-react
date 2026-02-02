import { test } from '@testing';

export default test.describe.parallel('Scrolling performance', () => {
  test('scrolls the table with performance tracing', async ({
    page,
    tracingModel,
  }) => {
    test.setTimeout(10000); // 10 seconds for performance tracing
    await page.waitForInfinite();

    // Start the performance trace
    const stopTracing = await tracingModel.start();

    const scrollContainer = page.locator('.InfiniteVirtualScrollContainer');

    await scrollContainer.hover();

    await page.mouse.wheel(0, 1000);
    await page.mouse.wheel(0, 2000);
    await page.mouse.wheel(0, 3000);
    await page.mouse.wheel(0, 4000);
    await page.mouse.wheel(0, 5000);

    // Stop the trace - this will save the trace file
    await stopTracing({
      compare: 'scriptingTime',
    });
  });
});

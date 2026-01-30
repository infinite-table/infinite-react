import { test } from '@testing';

export default test.describe.parallel('Update performance test', () => {
  test('clicks update button 30 times with performance tracing', async ({
    page,
    tracingModel,
  }) => {
    test.setTimeout(10000); // 10 seconds for performance tracing
    await page.waitForInfinite();

    // Start the performance trace
    const stopTracing = await tracingModel.start();

    const updateButton = page.getByRole('button', {
      name: 'update',
      exact: true,
    });

    // Click the update button 30 times
    for (let i = 0; i < 30; i++) {
      await updateButton.click();
      // Small delay to allow the update to process and render
      await page.waitForTimeout(50);
    }

    // Stop the trace - this will save the trace file
    await stopTracing();
  });
});

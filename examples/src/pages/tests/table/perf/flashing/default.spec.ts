import { test, expect } from '@testing';

export default test.describe.parallel('Flashing', () => {
  test('perf should remain stable for 50 clicks', async ({
    page,
    tracingModel,
  }) => {
    test.setTimeout(20000); // 50 clicks + tracing need more than default 5s
    await page.waitForInfinite();
    // Wait for the button to be visible
    const updateButton = page.getByRole('button', { name: 'Update Cell' });
    await expect(updateButton).toBeVisible();

    const stop = await tracingModel.start();

    console.log('\n  Starting 50 Update Cell clicks...\n');

    const clickCount = 50;
    for (let i = 0; i < clickCount; i++) {
      await updateButton.click();
      await page.waitForTimeout(20);

      if ((i + 1) % 10 === 0) {
        console.log(`  Progress: ${i + 1}/${clickCount} clicks completed`);
      }
    }

    await stop();
  });

  test('perf should be fine when single click', async ({
    page,
    tracingModel,
  }) => {
    await page.waitForInfinite();
    const updateButton = page.getByRole('button', { name: 'Update Cell' });
    await expect(updateButton).toBeVisible();

    const stop = await tracingModel.start();

    await updateButton.click();
    await stop();
  });

  test('should be able to collapse and expand nodes with no error', async ({
    page,
    tracingModel,
  }) => {
    await page.waitForInfinite();
    await page.failOnConsoleErrors();

    const stop = await tracingModel.start();

    let collapseIcon = page
      .locator('svg[data-name="expand-collapse-icon"][data-state="expanded"]')
      .first();

    // collapse 2 nodes
    await collapseIcon.click();
    await collapseIcon.click();
    await stop();
  });
});

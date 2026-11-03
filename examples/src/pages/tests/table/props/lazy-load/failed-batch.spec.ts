import { test, expect } from '@testing';
import type { Page } from '@playwright/test';

const callsOfBatch = (page: Page, start: number) =>
  page.evaluate(
    (start) =>
      (globalThis as any).batchCalls.filter((call: number) => call === start)
        .length,
    start,
  );

export default test.describe.parallel('Lazy load with a failing batch', () => {
  test('a batch that keeps failing is requested again only when its rows are rendered again', async ({
    page,
    apiModel,
  }) => {
    await page.waitForInfinite();
    await page.evaluate(() => ((globalThis as any).failingBatches = [100]));

    await apiModel.evaluate((api) => api.scrollRowIntoView(110));
    await expect.poll(() => callsOfBatch(page, 100)).toBeGreaterThan(0);

    await page.waitForTimeout(500);
    const failedCalls = await callsOfBatch(page, 100);
    await page.waitForTimeout(1000);
    expect(await callsOfBatch(page, 100)).toBe(failedCalls);

    await page.evaluate(() => ((globalThis as any).failingBatches = []));
    await apiModel.evaluate((api) => api.scrollRowIntoView(0));
    await apiModel.evaluate((api) => api.scrollRowIntoView(110));

    await expect
      .poll(() => callsOfBatch(page, 100))
      .toBeGreaterThan(failedCalls);
    await expect
      .poll(() =>
        apiModel.evaluateDataSource(
          (api) => api.getRowInfoByIndex(110)?.data?.name,
        ),
      )
      .toBe('Row 110');
  });
});

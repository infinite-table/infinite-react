import { test, expect } from '@testing';
import type { Page } from '@playwright/test';

// the server keeps the TypeScript rows (1 and 3) and sends the counts of all 6 rows:
// frontend has 2 rows, backend 3 and mobile 1 (filtered out completely)

const headerCheckbox =
  '.InfiniteHeaderCell[data-column-id="checkbox"] input[type="checkbox"]';

// true for checked, false for unchecked, null for indeterminate
const headerState = (page: Page) =>
  page
    .locator(headerCheckbox)
    .evaluate((input: HTMLInputElement) =>
      input.indeterminate ? null : input.checked,
    );

const groupState = (page: Page, groupKeys: string[]) =>
  page.evaluate(
    (groupKeys) =>
      (
        globalThis as any
      ).INFINITE_GRID_API.rowSelectionApi.getGroupRowSelectionState(groupKeys),
    groupKeys,
  );

const setTarget = (page: Page, target: 'all' | 'visible') =>
  page.evaluate((target) => (globalThis as any).setTarget(target), target);

export default test.describe.parallel(
  'Lazy grouped multiRowSelectionTarget with unfiltered counts from the server',
  () => {
    test('groups and the header count the rows without the filter only for "all"', async ({
      page,
    }) => {
      await page.waitForInfinite();
      await expect(
        page.locator('.InfiniteColumnCell', { hasText: 'backend' }).first(),
      ).toBeVisible();

      await page.evaluate(() =>
        (globalThis as any).INFINITE_GRID_API.rowSelectionApi.selectRow(3, [
          'backend',
        ]),
      );
      await expect.poll(() => groupState(page, ['backend'])).toBe(null);

      await setTarget(page, 'visible');
      await expect.poll(() => groupState(page, ['backend'])).toBe(true);

      await setTarget(page, 'all');
      for (const stack of ['backend', 'frontend']) {
        await page.evaluate(
          (stack) =>
            (globalThis as any).INFINITE_GRID_API.rowSelectionApi.selectGroupRow(
              [stack],
            ),
          stack,
        );
        await expect.poll(() => groupState(page, [stack])).toBe(true);
      }
      // the mobile group is filtered out completely, and is not selected
      await expect.poll(() => headerState(page)).toBe(null);

      await setTarget(page, 'visible');
      await expect.poll(() => headerState(page)).toBe(true);
    });
  },
);

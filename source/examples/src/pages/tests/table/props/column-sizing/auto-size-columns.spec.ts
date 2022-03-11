import { getColumnWidths } from '../../../testUtils';
import { test, expect } from '@playwright/test';

function roundDownToTens(val: number) {
  return val - (val % 10);
}
export default test.describe.parallel('Column autosizing tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/table/props/column-sizing/auto-size-columns`);
    await page.waitForSelector('[data-column-id]');
  });

  test('expect autoSizeColumnsKey.columnsToResize to work', async ({
    page,
  }) => {
    let widths = await getColumnWidths(['id', 'country', 'city', 'age'], {
      page,
    });

    expect(widths).toEqual([200, 300, 200, 800]);

    await page.evaluate(() => {
      (window as any).autoSize = {
        columnsToResize: ['id', 'country', 'city'],
        key: Date.now(),
      };
    });

    await page.click('button');

    await page.waitForTimeout(20);

    widths = await getColumnWidths(['id', 'country', 'city', 'age'], { page });

    // expect(widths).toEqual([67, 127, 188, 800]);
    expect(widths.map(roundDownToTens)).toEqual([60, 120, 180, 800]);
  });

  test('expect autoSizeColumnsKey.columnsToSkip to work', async ({ page }) => {
    let widths = await getColumnWidths(['id', 'country', 'city', 'age'], {
      page,
    });

    expect(widths).toEqual([200, 300, 200, 800]);

    await page.evaluate(() => {
      (window as any).autoSize = {
        columnsToSkip: ['id'],
        key: Date.now(),
        includeHeader: false,
      };
    });

    await page.click('button');

    await page.waitForTimeout(20);

    widths = await getColumnWidths(['id', 'country', 'city', 'age'], { page });

    // expect(widths).toEqual([200, 127, 188, 50]);
    expect(widths.map(roundDownToTens)).toEqual([200, 120, 180, 50]);
  });

  test('expect autoSizeColumnsKey to work', async ({ page }) => {
    let widths = await getColumnWidths(['id', 'country', 'city', 'age'], {
      page,
    });

    expect(widths).toEqual([200, 300, 200, 800]);

    await page.evaluate(() => {
      (window as any).autoSize = Date.now();
    });

    await page.click('button');

    await page.waitForTimeout(20);

    widths = await getColumnWidths(['id', 'country', 'city', 'age'], { page });

    // expect(widths).toEqual([67, 127, 188, 133]);
    expect(widths.map(roundDownToTens)).toEqual([60, 120, 180, 130]);
  });
});

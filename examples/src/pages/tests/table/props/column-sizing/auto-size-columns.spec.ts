import { test, expect } from '@testing';

import { getColumnWidths } from '../../../testUtils';

const isWithinTolerance = (actual: number, expected: number, tolerance = 20) =>
  Math.abs(actual - expected) <= tolerance;

export default test.describe.parallel('Column autosizing tests', () => {
  test('expect autoSizeColumnsKey.columnsToResize to work', async ({
    page,
  }) => {
    await page.waitForInfinite();
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

    await page.waitForTimeout(50);

    widths = await getColumnWidths(['id', 'country', 'city', 'age'], { page });

    const expected = [60, 120, 190, 800];

    for (let i = 0; i < expected.length; i++) {
      expect(isWithinTolerance(widths[i], expected[i])).toBeTruthy();
    }
  });

  test('expect autoSizeColumnsKey.columnsToSkip to work', async ({ page }) => {
    await page.waitForInfinite();
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

    const expected = [200, 130, 200, 50];

    for (let i = 0; i < expected.length; i++) {
      expect(isWithinTolerance(widths[i], expected[i])).toBeTruthy();
    }
  });

  test('expect autoSizeColumnsKey to work', async ({ page }) => {
    await page.waitForInfinite();
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

    const expected = [60, 120, 190, 140];

    for (let i = 0; i < expected.length; i++) {
      expect(isWithinTolerance(widths[i], expected[i])).toBeTruthy();
    }
  });
});

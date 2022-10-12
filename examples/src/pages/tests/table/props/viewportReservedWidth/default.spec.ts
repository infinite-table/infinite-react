import {
  getColumnWidths,
  resizeColumnById,
} from '@examples/pages/tests/testUtils';

import { test, expect } from '@testing';

export default test.describe.parallel('Viewport reserved width', () => {
  test('works correctly', async ({ page }) => {
    await page.waitForInfinite();

    let widths = await getColumnWidths(
      ['index', 'preferredLanguage', 'salary', 'age'],
      { page },
    );

    expect(
      await page.evaluate(() => (window as any).viewportReservedWidth),
    ).toEqual(0);

    await resizeColumnById('index', -50, { page });
    await resizeColumnById('preferredLanguage', -150, { page });
    await resizeColumnById('salary', -100, { page });

    expect(
      await page.evaluate(() => (window as any).viewportReservedWidth),
    ).toEqual(300);

    let newWidths = await getColumnWidths(
      ['index', 'preferredLanguage', 'salary', 'age'],
      { page },
    );

    expect(newWidths).toEqual([
      widths[0] - 50,
      widths[1] - 150,
      widths[2] - 100,
      widths[3],
    ]);

    await page.click('button');

    expect(
      await page.evaluate(() => (window as any).viewportReservedWidth),
    ).toEqual(0);

    newWidths = await getColumnWidths(
      ['index', 'preferredLanguage', 'salary', 'age'],
      { page },
    );

    expect(newWidths).toEqual(widths);
  });
});

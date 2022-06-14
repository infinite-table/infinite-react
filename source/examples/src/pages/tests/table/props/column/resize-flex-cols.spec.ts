import {
  getColumnWidths,
  resizeColumnById,
} from '@examples/pages/tests/testUtils';

import { test, expect } from '@testing';

export default test.describe.parallel('Column Resizing', () => {
  test('works correctly', async ({ page }) => {
    await page.waitForInfinite();

    let widths = await getColumnWidths(
      ['index', 'preferredLanguage', 'salary', 'age'],
      { page },
    );
    await resizeColumnById('salary', -50, { page });

    let newWidths = await getColumnWidths(
      ['index', 'preferredLanguage', 'salary', 'age'],
      { page },
    );

    expect(newWidths).toEqual([
      widths[0],
      widths[1],
      widths[2] - 50,
      widths[3],
    ]);

    let columnSizing = await page.evaluate(
      () => (window as any).onColumnSizingChange.getCalls()[0].args[0],
    );

    expect(columnSizing).toEqual({
      index: {
        flex: newWidths[0],
      },
      preferredLanguage: {
        flex: newWidths[1],
      },
      salary: {
        flex: newWidths[2],
      },
      // age is not included, since its fixed width and has not been resized
    });

    let viewportReservedWidth = await page.evaluate(
      () => (window as any).onViewportReservedWidthChange.getCalls()[0].args[0],
    );

    expect(viewportReservedWidth).toEqual(50);
  });
});

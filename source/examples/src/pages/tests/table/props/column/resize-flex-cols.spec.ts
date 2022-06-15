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

  /**
   * #advancedcolumnresizing
   *
   * This tests that flex columns are properly sized in the following scenario:
   *
   *  - resize a flex column - so new flex values are set in columnSizing, based on actual sizes from DOM:
   *      eg: we had 3 columns, of flex 1,3 and 2
   *      when a (flex) column is resized, `onColumnSizing` is called with new columnSizing that has `{ flex: ... }` for each of the flex
   *      columns, but the flex values are basically the actual pixel values from the DOM - we can't keep initial flexes, as resize would not
   *      work properly and the resize handle would jump out-of-place. So we use actual pixel values, for all flex columns, which has the effect
   *      of keeping the actual ratio between then even on a resize
   *  - the grid is resized
   *  - resize a flex column - new flex values are used in columnSizing when resizing is made - see #advancedcolumnresizing-important
   *      because we can't simply use the old column sizes from the `columnSizing` object in state, as the state `columnSizing` values
   *      might have been computed based on a different bodySize (grid size) and therefore not accurate for this column resize.
   */
  test('works correctly even after the grid is resized and has flex cols', async ({
    page,
  }) => {
    await page.waitForInfinite();
    let widths = await getColumnWidths(
      ['index', 'preferredLanguage', 'salary', 'age'],
      { page },
    );
    await resizeColumnById('salary', -50, { page });
    await resizeColumnById('salary', 50, { page });

    // click 6 times to add 600px

    await Promise.all(
      [...new Array(6)].map(async () => {
        await page.click('button[data-name="inc"]');
        await page.waitForTimeout(30);
      }),
    );

    let newWidths = await getColumnWidths(
      ['index', 'preferredLanguage', 'salary', 'age'],
      { page },
    );

    expect(newWidths).toEqual([
      widths[0] * 2,
      widths[1] * 2,
      widths[2] * 2,
      widths[3],
    ]);

    await resizeColumnById('salary', -50, { page });

    let finalWidths = await getColumnWidths(
      ['index', 'preferredLanguage', 'salary', 'age'],
      { page },
    );

    expect(finalWidths).toEqual([
      newWidths[0],
      newWidths[1],
      newWidths[2] - 50,
      newWidths[3],
    ]);
  });
});

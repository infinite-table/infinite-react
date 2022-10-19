import { test, expect } from '@testing';

export default test.describe.parallel('Column Resizing', () => {
  test('works correctly', async ({ page, columnModel }) => {
    await page.waitForInfinite();

    let widths = (
      await columnModel.getColumnWidths([
        'index',
        'preferredLanguage',
        'salary',
        'age',
      ])
    ).list;

    await columnModel.resizeColumn('salary', -50);

    let newWidths = (
      await columnModel.getColumnWidths([
        'index',
        'preferredLanguage',
        'salary',
        'age',
      ])
    ).list;

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
    columnModel,
  }) => {
    await page.waitForInfinite();
    const initialWidth = await page.evaluate(
      () => (window as any).initialWidth as number,
    );
    let widths1 = (
      await columnModel.getColumnWidths([
        'index',
        'preferredLanguage',
        'salary',
        'age',
      ])
    ).list;
    await columnModel.resizeColumn('salary', -50);
    await columnModel.resizeColumn('salary', 50);

    await page.waitForTimeout(50);

    let widths2 = (
      await columnModel.getColumnWidths([
        'index',
        'preferredLanguage',
        'salary',
        'age',
      ])
    ).list;

    const widths = widths1;

    expect(widths1).toEqual(widths2);

    await Promise.all(
      [...new Array(6)].map(async () => {
        await page.click('button[data-name="inc"]');
        await page.waitForTimeout(55);
      }),
    );

    const expectedGridWidth = initialWidth + 600;
    const selectorToExpect = `[data-value="${expectedGridWidth}"]`;

    await page.waitForSelector(selectorToExpect);

    let newWidths = (
      await columnModel.getColumnWidths([
        'index',
        'preferredLanguage',
        'salary',
        'age',
      ])
    ).list;

    expect(newWidths).toEqual([
      widths[0] * 2,
      widths[1] * 2,
      widths[2] * 2,
      widths[3],
    ]);

    await columnModel.resizeColumn('salary', -50);

    let finalWidths = (
      await columnModel.getColumnWidths([
        'index',
        'preferredLanguage',
        'salary',
        'age',
      ])
    ).list;

    expect(finalWidths).toEqual([
      newWidths[0],
      newWidths[1],
      newWidths[2] - 50,
      newWidths[3],
    ]);
  });
});

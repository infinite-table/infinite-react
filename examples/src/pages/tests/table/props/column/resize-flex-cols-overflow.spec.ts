import { test, expect } from '@testing';

const COLUMN_IDS = ['label', 'a', 'b', 'c'];

/**
 * The fixed columns exceed the grid width, so the flex column is pinned at
 * its min width - there is no space for it to flex into. Resizing it must
 * commit a fixed width (a flex value has no effect in this state) and every
 * subsequent resize must start from the committed size, not snap back to the
 * min width.
 */
export default test.describe.parallel(
  'Column Resizing - flex column with no space to flex',
  () => {
    test('resizing the flex column commits a width and resizes are cumulative', async ({
      page,
      columnModel,
    }) => {
      await page.waitForInfinite();

      const widths = (await columnModel.getColumnWidths(COLUMN_IDS)).list;

      // pinned at columnMinWidth, the fixed columns are untouched
      expect(widths).toEqual([50, 200, 200, 200]);

      await columnModel.resizeColumn('label', 100);

      expect((await columnModel.getColumnWidths(COLUMN_IDS)).list).toEqual([
        150, 200, 200, 200,
      ]);

      let columnSizing = await page.evaluate(
        () => (window as any).onColumnSizingChange.lastCall.args[0],
      );
      // a fixed width - and no flex left behind, as flex wins over width
      expect(columnSizing).toEqual({ label: { width: 150 } });

      // the second resize starts from the committed 150, not from 50
      await columnModel.resizeColumn('label', 50);

      expect((await columnModel.getColumnWidths(COLUMN_IDS)).list).toEqual([
        200, 200, 200, 200,
      ]);

      columnSizing = await page.evaluate(
        () => (window as any).onColumnSizingChange.lastCall.args[0],
      );
      expect(columnSizing).toEqual({ label: { width: 200 } });

      // and shrinking works from the committed size too
      await columnModel.resizeColumn('label', -70);

      expect((await columnModel.getColumnWidths(COLUMN_IDS)).list).toEqual([
        130, 200, 200, 200,
      ]);
    });
  },
);

import { expect, test } from '@testing';

export default test.describe.parallel(
  'DataSource.defaultSortInfo.valueGetter',
  () => {
    test('should work properly', async ({ page, headerModel, rowModel }) => {
      await page.waitForInfinite();

      const headerText = await (
        await headerModel.getHeaderCellLocator({ colId: 'y' })
      ).innerText();

      expect(headerText).toEqual('Year\n1');

      let values = await rowModel.getTextForColumnCells({ colId: 'y' });

      // expect ascending order
      expect(values).toEqual(
        //@ts-ignore
        [...values].sort((a: number, b: number) => a * 1 - b * 1),
      );

      // click to make it descending
      await headerModel.clickColumnHeader({ colId: 'y' });

      values = await rowModel.getTextForColumnCells({ colId: 'y' });

      // expect descending order
      expect(values).toEqual(
        //@ts-ignore
        [...values].sort((a: number, b: number) => b * 1 - a * 1),
      );

      // click remove sorting
      await headerModel.clickColumnHeader({ colId: 'y' });

      // click again to make it ascending
      await headerModel.clickColumnHeader({ colId: 'y' });

      values = await rowModel.getTextForColumnCells({ colId: 'y' });

      // expect ascending order
      expect(values).toEqual(
        //@ts-ignore
        [...values].sort((a: number, b: number) => a * 1 - b * 1),
      );
    });
  },
);

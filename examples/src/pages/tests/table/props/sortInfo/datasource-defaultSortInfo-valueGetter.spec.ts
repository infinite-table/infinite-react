import { expect, test, ElementHandle } from '@testing';

import { getColumnCells, getHeaderCellByColumnId } from '../../../testUtils';

export default test.describe.parallel(
  'DataSource.defaultSortInfo.valueGetter',
  () => {
    test('should work properly', async ({ page }) => {
      await page.waitForInfinite();

      const { bodyCells, headerCell } = await getColumnCells('y', {
        page,
      });

      expect(await headerCell.innerText()).toEqual('Year\n1');

      let values = await Promise.all(
        bodyCells.map(
          async (cell: ElementHandle) =>
            await cell.evaluate((node) => node.textContent),
        ),
      );

      // expect ascending order
      expect(values).toEqual(
        //@ts-ignore
        [...values].sort((a: number, b: number) => a * 1 - b * 1),
      );

      // click to make it descending
      await getHeaderCellByColumnId('y', { page }).click();

      values = await Promise.all(
        bodyCells.map(
          async (cell: ElementHandle) =>
            await cell.evaluate((node) => node.textContent),
        ),
      );

      // expect descending order
      expect(values).toEqual(
        //@ts-ignore
        [...values].sort((a: number, b: number) => b * 1 - a * 1),
      );

      // click remove sorting
      await getHeaderCellByColumnId('y', { page }).click();
      // click again to make it ascending
      await getHeaderCellByColumnId('y', { page }).click();

      values = await Promise.all(
        bodyCells.map(
          async (cell: ElementHandle) =>
            await cell.evaluate((node) => node.textContent),
        ),
      );

      // expect ascending order
      expect(values).toEqual(
        //@ts-ignore
        [...values].sort((a: number, b: number) => a * 1 - b * 1),
      );
    });
  },
);

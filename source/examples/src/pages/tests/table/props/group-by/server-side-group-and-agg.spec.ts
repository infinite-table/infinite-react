import { test, expect, Page } from '@testing';

import { getColumnCells, toggleGroupRow } from '../../../testUtils';

const getColumnContents = async (colId: string, { page }: { page: Page }) => {
  const cells = await getColumnCells(colId, { page });

  const result = await Promise.all(
    cells.bodyCells.map(
      async (cell: any) => await cell.evaluate((node: any) => node.innerText),
    ),
  );

  return result;
};

export default test.describe.parallel(
  'Server-side grouped with agg and no pivot',
  () => {
    test('should work and lazily load data', async ({ page }) => {
      await page.waitForInfinite();

      const contents = await getColumnContents('group-by-country', { page });

      expect(contents).toEqual([
        'Canada',
        'France',
        'Germany',
        'India',
        'Mexico',
        'Sweden',
        'United Arab Emirates',
        'United States',
      ]);

      await toggleGroupRow({ rowIndex: 0 }, { page });

      await page.waitForTimeout(20);

      const countryCol = await getColumnContents('country', { page });

      // as we've expanded the first row and since it has only 1 child in this example
      // we expect the country col to have another value for the same entry
      expect(countryCol).toEqual([contents[0], ...contents]);
    });
  },
);

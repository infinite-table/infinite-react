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
    test('should work and lazily load data that has a child dataset', async ({
      page,
    }) => {
      await page.waitForInfinite();

      const contents = await getColumnContents('group-by-country', { page });

      expect(contents).toEqual([
        'Canada',

        'France',
        // france comes with a child dataset already loaded, so the group text is empty for that, as we're in a child row
        '',
        'Germany',
        'India',
        'Mexico',
        'Sweden',
        'United Arab Emirates',
        'United States',
      ]);

      await toggleGroupRow({ rowIndex: 0 }, { page });

      const countryCol = await getColumnContents('country', { page });

      // France group row is rendered as expanded
      // so we expect in the "country" column to have it be there
      expect(countryCol).toEqual(contents.map((c) => c || 'France'));
    });
  },
);

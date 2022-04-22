import { test, expect, Page, Response } from '@testing';

import { getColumnCells } from '../../../testUtils';

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
  'Server-side batched grouping with pinned group column.',
  () => {
    test('should work and lazily load data', async ({ page }) => {
      const condition = (response: Response) =>
        response.url().includes('developers') && response.status() === 200;

      await page.waitForResponse(condition);

      let cells = await getColumnContents('group-col', { page });

      const firstBatch = [
        'Argentina',
        'Australia',
        'Brazil',
        'Canada',
        'China',
      ];

      expect(cells.filter(Boolean)).toEqual(firstBatch);

      await page.waitForResponse(condition);

      cells = await getColumnContents('group-col', { page });

      expect(cells.slice(0, 10).filter(Boolean)).toEqual([
        ...firstBatch,
        'France',
        'Germany',
        'India',
        'Indonesia',
        'Italy',
      ]);
    });
  },
);

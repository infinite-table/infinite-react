import { test, expect, Page, Response } from '@testing';

import { getColumnCells } from '../../../testUtils';

const getColumnContents = async (colId: string, { page }: { page: Page }) => {
  const cells = await getColumnCells({ colId }, { page });

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
      page.load();
      const responses: string[] = [];

      const condition = (response: Response) => {
        const ok =
          response.url().includes('developers') && response.status() === 200;

        if (ok) {
          return response.json().then((resp) => {
            responses.push(...resp.data.map((d: any) => d.data.country));
            responses.push('-');

            return ok;
          });
        }
        return ok;
      };

      await page.waitForResponse(condition);

      expect(responses).toEqual([
        'Argentina',
        'Australia',
        'Brazil',
        'Canada',
        'China',
        // 'France',
        // 'Germany',
        // 'India',
        // 'Indonesia',
        // 'Italy',
        '-',
      ]);

      await page.waitForResponse(condition);

      const cells = await getColumnContents('group-col', { page });

      expect(cells.slice(0, 10).filter(Boolean)).toEqual([
        'Argentina',
        'Australia',
        'Brazil',
        'Canada',
        'China',
        'France',
        'Germany',
        'India',
        'Indonesia',
        'Italy',
      ]);

      expect(responses).toEqual([
        'Argentina',
        'Australia',
        'Brazil',
        'Canada',
        'China',
        '-',
        'France',
        'Germany',
        'India',
        'Indonesia',
        'Italy',
        // '-',
        // 'Japan',
        // 'Mexico',
        // 'Saudi Arabia',
        // 'South Africa',
        // 'Spain',
        '-',
      ]);
    });
  },
);

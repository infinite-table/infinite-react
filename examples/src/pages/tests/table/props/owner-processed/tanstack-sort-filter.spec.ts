import { test, expect } from '@testing';

const ALL = ['Bob', 'Alice', 'Carl', 'Dana', 'Eve'];
const BY_NAME = ['Alice', 'Bob', 'Carl', 'Dana', 'Eve'];

export default test.describe.parallel(
  'Data sorted and filtered by its owner (TanStack Query)',
  () => {
    test('the grid shows the rows as the query returns them and does not sort or filter them again', async ({
      page,
      headerModel,
      rowModel,
    }) => {
      const names = () => rowModel.getTextForColumnCells({ colId: 'name' });
      const queryCalls = () =>
        page.evaluate(() => (window as any).queryCalls as number);
      const releaseQuery = () =>
        page.evaluate(() => (window as any).releaseQuery());

      // no rows until the first query is released
      await page.waitForInfiniteHeader();
      await releaseQuery();
      await expect.poll(names).toEqual(ALL);

      const initialCalls = await queryCalls();

      // sorting starts a new query; until it resolves, the previous rows are
      // shown as they are - a grid sorting them itself would reorder them now
      await headerModel.clickToSortColumn({ colId: 'name' });
      await expect.poll(queryCalls).toBe(initialCalls + 1);
      expect(await names()).toEqual(ALL);

      await releaseQuery();
      await expect.poll(names).toEqual(BY_NAME);

      // same for filtering: the rows are not filtered before the query resolves
      await headerModel.filterColumn({ colId: 'name' }, 'a');
      await expect.poll(queryCalls).toBe(initialCalls + 2);
      expect(await names()).toEqual(BY_NAME);

      await releaseQuery();
      await expect.poll(names).toEqual(['Alice', 'Carl', 'Dana']);

      await headerModel.filterColumn({ colId: 'name' }, '');
      await expect.poll(queryCalls).toBe(initialCalls + 3);
      await releaseQuery();
      await expect.poll(names).toEqual(BY_NAME);
    });
  },
);

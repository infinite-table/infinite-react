import { test, expect, Page } from '@testing';

import { getHeaderCellByColumnId } from '../../../testUtils';

import { employees } from './employees10';

async function isColumnDisplayed(colId: string, { page }: { page: Page }) {
  return (await getHeaderCellByColumnId(colId, { page }).count()) > 0;
}

async function getRenderedRowCount({ page }: { page: Page }) {
  return await page.$$eval(
    '.InfiniteColumnCell[data-row-index][data-col-index="0"]',
    (rows) => rows.length,
  );
}

const timeout = 30;

async function setGroupBy(
  groupBy: { field: string }[],
  { page }: { page: Page },
) {
  await page.evaluate((groupBy) => {
    (window as any).setGroupBy(groupBy);
  }, groupBy);
}
export default test.describe.parallel(
  'Table column.defaultHiddenWhenGroupedBy',
  () => {
    test('team column should be hidden whenever there is grouping', async ({
      page,
    }) => {
      await page.load();
      expect(await isColumnDisplayed('teamID', { page })).toBe(false);

      expect(await getRenderedRowCount({ page })).not.toEqual(employees.length);

      await setGroupBy([], { page });
      await page.waitForTimeout(timeout);

      expect(await getRenderedRowCount({ page })).toEqual(employees.length);

      expect(await isColumnDisplayed('teamID', { page })).toBe(true);

      await setGroupBy([{ field: 'country' }], { page });
      await page.waitForTimeout(timeout);

      expect(await getRenderedRowCount({ page })).not.toEqual(employees.length);
      expect(await isColumnDisplayed('teamID', { page })).toBe(false);
    });

    test('department should be hidden whenever there is grouping by department', async ({
      page,
    }) => {
      await page.load();
      expect(await isColumnDisplayed('departmentID', { page })).toBe(false);
      expect(await getRenderedRowCount({ page })).not.toEqual(employees.length);

      await setGroupBy([{ field: 'country' }], { page });
      await page.waitForTimeout(timeout);

      expect(await isColumnDisplayed('departmentID', { page })).toBe(true);

      await setGroupBy([{ field: 'country' }, { field: 'department' }], {
        page,
      });
      await page.waitForTimeout(timeout);

      expect(await isColumnDisplayed('departmentID', { page })).toBe(false);
    });

    test('salary should be hidden whenever there is grouping by salary or team', async ({
      page,
    }) => {
      await page.load();
      expect(await isColumnDisplayed('salaryID', { page })).toBe(false);
      expect(await getRenderedRowCount({ page })).not.toEqual(employees.length);

      await setGroupBy([{ field: 'country' }], { page });
      await page.waitForTimeout(timeout);

      expect(await isColumnDisplayed('salaryID', { page })).toBe(true);

      await setGroupBy([{ field: 'country' }, { field: 'team' }], { page });
      await page.waitForTimeout(timeout);

      expect(await isColumnDisplayed('salaryID', { page })).toBe(false);
    });
  },
);

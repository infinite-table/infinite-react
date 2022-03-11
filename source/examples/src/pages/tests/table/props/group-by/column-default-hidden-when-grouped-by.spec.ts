import { getHeaderCellByColumnId } from '../../../testUtils';
import { test, expect, Page } from '@playwright/test';

async function isColumnDisplayed(colId: string, { page }: { page: Page }) {
  const handle = await getHeaderCellByColumnId(colId, { page });

  const result = handle != null;

  // console.log(handle, result);

  return result;
}

async function getRenderedRowCount({ page }: { page: Page }) {
  return await page.$$eval('[data-row-index]', (rows) => rows.length);
}

import { employees } from './employees10';

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
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `/tests/table/props/group-by/column-default-hidden-when-grouped-by`,
      );

      // wait for rendering
      await page.waitForSelector('[data-row-index]');
    });

    test('team column should be hidden whenever there is grouping', async ({
      page,
    }) => {
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

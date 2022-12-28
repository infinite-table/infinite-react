import { test, expect, Page } from '@testing';

import { employees } from './employees10';

const timeout = 40;

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
      columnModel,
      rowModel,
    }) => {
      await page.load();
      expect(await columnModel.isColumnDisplayed('teamID')).toBe(false);

      expect(await rowModel.getRenderedRowCount()).not.toEqual(
        employees.length,
      );

      await setGroupBy([], { page });
      await page.waitForTimeout(100);

      expect(await rowModel.getRenderedRowCount()).toEqual(employees.length);

      expect(await columnModel.isColumnDisplayed('teamID')).toBe(true);

      await setGroupBy([{ field: 'country' }], { page });
      await page.waitForTimeout(timeout);

      expect(await rowModel.getRenderedRowCount()).not.toEqual(
        employees.length,
      );
      expect(await columnModel.isColumnDisplayed('teamID')).toBe(false);
    });

    test('department should be hidden whenever there is grouping by department', async ({
      page,
      columnModel,
      rowModel,
    }) => {
      await page.load();
      expect(await columnModel.isColumnDisplayed('departmentID')).toBe(false);
      expect(await rowModel.getRenderedRowCount()).not.toEqual(
        employees.length,
      );

      await setGroupBy([{ field: 'country' }], { page });
      await page.waitForTimeout(timeout);

      expect(await columnModel.isColumnDisplayed('departmentID')).toBe(true);

      await setGroupBy([{ field: 'country' }, { field: 'department' }], {
        page,
      });
      await page.waitForTimeout(timeout);

      expect(await columnModel.isColumnDisplayed('departmentID')).toBe(false);
    });

    test('salary should be hidden whenever there is grouping by salary or team', async ({
      page,
      rowModel,
      columnModel,
    }) => {
      await page.load();
      expect(await columnModel.isColumnDisplayed('salaryID')).toBe(false);
      expect(await rowModel.getRenderedRowCount()).not.toEqual(
        employees.length,
      );

      await setGroupBy([{ field: 'country' }], { page });
      await page.waitForTimeout(timeout);

      expect(await columnModel.isColumnDisplayed('salaryID')).toBe(true);

      await setGroupBy([{ field: 'country' }, { field: 'team' }], { page });
      await page.waitForTimeout(timeout);

      expect(await columnModel.isColumnDisplayed('salaryID')).toBe(false);
    });
  },
);

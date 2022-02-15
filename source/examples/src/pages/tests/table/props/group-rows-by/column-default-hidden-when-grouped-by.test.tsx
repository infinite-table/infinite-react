import {
  getHeaderCellByColumnId,
  getHeaderColumnIds,
} from '../../../testUtils';

async function isColumnDisplayed(colId: string) {
  const handle = await getHeaderCellByColumnId(colId);

  const result = handle != null;

  // console.log(handle, result);

  return result;
}

async function getRenderedRowCount() {
  return await page.$$eval('[data-row-index]', (rows) => rows.length);
}

import { employees } from './employees10';

async function setGroupBy(groupBy: { field: string }[]) {
  await page.evaluate((groupBy) => {
    (window as any).setGroupBy(groupBy);
  }, groupBy);
}
export default describe('Table column.defaultHiddenWhenGroupedBy', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/group-rows-by/column-default-hidden-when-grouped-by`,
    );
  });

  beforeEach(async () => {
    await page.reload();

    // wait for rendering
    await page.waitForSelector('[data-row-index]');
  });

  it('team column should be hidden whenever there is grouping', async () => {
    expect(await isColumnDisplayed('teamID')).toBe(false);

    expect(await getRenderedRowCount()).not.toEqual(employees.length);

    await setGroupBy([]);
    await page.waitForTimeout(10);

    expect(await getRenderedRowCount()).toEqual(employees.length);

    expect(await isColumnDisplayed('teamID')).toBe(true);

    await setGroupBy([{ field: 'country' }]);
    await page.waitForTimeout(10);

    expect(await getRenderedRowCount()).not.toEqual(employees.length);
    expect(await isColumnDisplayed('teamID')).toBe(false);
  });

  it('department should be hidden whenever there is grouping by department', async () => {
    expect(await isColumnDisplayed('departmentID')).toBe(false);
    expect(await getRenderedRowCount()).not.toEqual(employees.length);

    await setGroupBy([{ field: 'country' }]);
    await page.waitForTimeout(10);

    expect(await isColumnDisplayed('departmentID')).toBe(true);

    await setGroupBy([{ field: 'country' }, { field: 'department' }]);
    await page.waitForTimeout(10);

    expect(await isColumnDisplayed('departmentID')).toBe(false);
  });

  it('salary should be hidden whenever there is grouping by salary or team', async () => {
    expect(await isColumnDisplayed('salaryID')).toBe(false);
    expect(await getRenderedRowCount()).not.toEqual(employees.length);

    await setGroupBy([{ field: 'country' }]);
    await page.waitForTimeout(10);

    expect(await isColumnDisplayed('salaryID')).toBe(true);

    await setGroupBy([{ field: 'country' }, { field: 'team' }]);
    await page.waitForTimeout(10);

    expect(await isColumnDisplayed('salaryID')).toBe(false);
  });
});

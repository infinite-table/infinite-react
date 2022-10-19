import { test, expect, Page } from '@testing';

import { Employee, employees } from './employees10';

const mapFn = (x: Employee, i: number) =>
  'index: ' + (1000 - i) + ' - ' + x.age * 2 + '!';

async function isLoadMaskHidden(page: Page) {
  return await page.locator('.Infinite-LoadMask').isHidden();
}
export default test.describe.parallel('Column valueFormatter', () => {
  test('to be applied correctly, and valueGetter to be piped in', async ({
    page,
    rowModel,
    headerModel,
  }) => {
    await page.waitForInfinite();

    const col = { colId: 'age' };

    let values = await rowModel.getTextForColumnCells(col);

    expect(values).toEqual(employees.map(mapFn));
    await page.waitForTimeout(50);

    let loadMaskHidden = await isLoadMaskHidden(page);
    expect(loadMaskHidden).toBe(true);

    await headerModel.clickColumnHeader(col);

    loadMaskHidden = await isLoadMaskHidden(page);
    expect(loadMaskHidden).toBe(true);

    values = await rowModel.getTextForColumnCells(col);

    expect(values).toEqual(
      employees.sort((e1, e2) => e1.age - e2.age).map(mapFn),
    );
  });
});

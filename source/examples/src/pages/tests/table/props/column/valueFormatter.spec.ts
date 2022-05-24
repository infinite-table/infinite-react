import {
  getColumnCells,
  getValuesByColumnId,
} from '@examples/pages/tests/testUtils';
import { test, expect } from '@testing';

import { Employee, employees } from './employees10';

const mapFn = (x: Employee, i: number) =>
  'index: ' + (1000 - i) + ' - ' + x.age * 2 + '!';

export default test.describe.parallel('Column valueFormatter', () => {
  test('to be applied correctly, and valueGetter to be piped in', async ({
    page,
  }) => {
    await page.waitForInfinite();

    const { headerCell } = await getColumnCells('age', {
      page,
    });

    let values = await getValuesByColumnId('age', { page });

    expect(values).toEqual(employees.map(mapFn));

    await headerCell.click();

    values = await getValuesByColumnId('age', { page });

    expect(values).toEqual(
      employees.sort((e1, e2) => e1.age - e2.age).map(mapFn),
    );
  });
});

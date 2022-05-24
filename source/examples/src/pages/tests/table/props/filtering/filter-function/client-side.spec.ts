import { getRowCount } from '@examples/pages/tests/testUtils';
import { test, expect } from '@testing';

import { employees } from '../employees10';

import {
  departmentManagementFilterFunction,
  departmentMarketingFilterFunction,
} from './filterFn';

export default test.describe.parallel('Client side filterFunction', () => {
  test('Filters correctly', async ({ page }) => {
    await page.waitForInfinite();

    expect(await getRowCount({ page })).toEqual(employees.length);

    await page.click('button[data-name="management"]');
    expect(await getRowCount({ page })).toEqual(
      employees.filter((data) => departmentManagementFilterFunction({ data }))
        .length,
    );

    await page.click('button[data-name="marketing"]');
    expect(await getRowCount({ page })).toEqual(
      employees.filter((data) => departmentMarketingFilterFunction({ data }))
        .length,
    );

    await page.click('button[data-name="none"]');
    expect(await getRowCount({ page })).toEqual(employees.length);
  });
});

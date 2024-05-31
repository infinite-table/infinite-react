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

    const unfiltered = page.getByLabel('unfiltered-count');
    const expectedUnfilteredCount = `unfiltered count: ${employees.length}`;

    expect(await unfiltered.textContent()).toEqual(expectedUnfilteredCount);

    await page.click('button[data-name="management"]');
    expect(await getRowCount({ page })).toEqual(
      employees.filter((data) => departmentManagementFilterFunction({ data }))
        .length,
    );
    expect(await unfiltered.textContent()).toEqual(expectedUnfilteredCount);

    await page.click('button[data-name="marketing"]');
    expect(await getRowCount({ page })).toEqual(
      employees.filter((data) => departmentMarketingFilterFunction({ data }))
        .length,
    );
    expect(await unfiltered.textContent()).toEqual(expectedUnfilteredCount);

    await page.click('button[data-name="none"]');
    expect(await getRowCount({ page })).toEqual(employees.length);
    expect(await unfiltered.textContent()).toEqual(expectedUnfilteredCount);
  });
});

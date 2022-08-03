import {
  getCellNodeLocator,
  getRowCount,
} from '@examples/pages/tests/testUtils';

import { test, expect } from '@testing';

export default test.describe.parallel('Column piped rendering', () => {
  test('is working with hooks', async ({ page }) => {
    await page.waitForInfinite();

    const groupRow = getCellNodeLocator(
      { rowIndex: 0, columnId: 'country' },
      { page },
    );

    expect(await groupRow.locator('button').innerText()).toEqual('Group: USA');

    const leafRow = getCellNodeLocator(
      { rowIndex: 1, columnId: 'country' },
      { page },
    );
    expect(await leafRow.locator('button').innerText()).toEqual('Country: USA');
  });

  test('is working with group icon', async ({ page }) => {
    await page.waitForInfinite();

    const groupRow = getCellNodeLocator(
      { rowIndex: 0, columnId: 'group-by-country' },
      { page },
    );

    const btn = groupRow.locator('button');
    expect(await btn.isVisible()).toBe(true);

    expect(await getRowCount({ page })).toBe(5);

    await btn.locator('svg').click();

    expect(await getRowCount({ page })).toBe(3);

    await btn.locator('svg').click();

    expect(await getRowCount({ page })).toBe(5);
  });
});

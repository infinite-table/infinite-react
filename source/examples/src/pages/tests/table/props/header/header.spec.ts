import { getHeaderColumnIds } from '../../../testUtils';
import { test, expect } from '@playwright/test';

export default test.describe.parallel('RawList', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/table/props/header/header`);
  });

  test('should correctly render virtualized header', async ({ page }) => {
    await page.waitForTimeout(20);
    let cols = await getHeaderColumnIds({ page });

    expect(cols).toEqual(['Id', 'FirstName', 'LastName', 'Age']);
    await page.click('button');

    cols = await getHeaderColumnIds({ page });

    expect(cols).toEqual([]);
  });
});

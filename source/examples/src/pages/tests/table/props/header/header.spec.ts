import { test, expect } from '@testing';

import { getHeaderColumnIds } from '../../../testUtils';

export default test.describe.parallel('RawList', () => {
  test('should correctly render virtualized header', async ({ page }) => {
    await page.waitForTimeout(20);
    let cols = await getHeaderColumnIds({ page });

    expect(cols).toEqual(['Id', 'FirstName', 'LastName', 'Age']);
    await page.click('button');

    cols = await getHeaderColumnIds({ page });

    expect(cols).toEqual([]);
  });
});

import {
  getHeaderCellByColumnId,
  getValuesByColumnId,
} from '@examples/pages/tests/testUtils';
import { test, expect } from '@testing';

export default test.describe.parallel('Custom filter type', () => {
  test('works correctly', async ({ page }) => {
    await page.waitForInfinite();

    await getHeaderCellByColumnId('country', { page })
      .locator('input')
      .type('United States', { delay: 50 });

    const values = await getValuesByColumnId('country', { page });

    expect(values).toEqual(['usa', 'usa']);
  });
});

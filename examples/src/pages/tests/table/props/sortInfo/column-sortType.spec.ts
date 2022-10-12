import { expect, test } from '@testing';

import {
  getHeaderCellByColumnId,
  getValuesByColumnId,
} from '../../../testUtils';

export default test.describe.parallel('column.sortType', () => {
  test('should work properly', async ({ page }) => {
    await page.waitForInfinite();

    await getHeaderCellByColumnId('sales', {
      page,
    }).click();

    const values = await getValuesByColumnId('sales', { page });
    const sorted = values.map((x: any) => x * 1);

    sorted.sort((a, b) => a - b);

    expect(values).toEqual(sorted.map((x) => x + ''));
  });
});

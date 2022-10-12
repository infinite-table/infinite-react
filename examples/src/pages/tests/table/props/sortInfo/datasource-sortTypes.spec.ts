import { expect, test } from '@testing';

import {
  getHeaderCellByColumnId,
  getValuesByColumnId,
} from '../../../testUtils';

export default test.describe.parallel('DataSource.sortTypes', () => {
  test('should work properly', async ({ page }) => {
    await page.waitForInfinite();

    await getHeaderCellByColumnId('color', {
      page,
    }).click();

    const values = await getValuesByColumnId('color', { page });

    // magenta comes first
    expect(values.slice(0, 2)).toEqual(['magenta', 'magenta']);
  });
});

import { expect, test } from '@testing';

import { getValuesByColumnId } from '../../../testUtils';

export default test.describe.parallel('DataSource.sortTypes', () => {
  test('should work properly with initial sortInfo', async ({ page }) => {
    await page.waitForInfinite();

    const values = await getValuesByColumnId('color', { page });

    // magenta comes first
    expect(values.slice(0, 2)).toEqual(['magenta', 'magenta']);
  });
});

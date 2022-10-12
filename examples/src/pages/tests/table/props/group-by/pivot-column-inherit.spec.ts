import { test, expect } from '@testing';

import { getHeaderColumnIds, getColumnWidths } from '../../../testUtils';

export default test.describe.parallel('Pivoting and generated columns', () => {
  test('should generate the correct columns', async ({ page }) => {
    await page.waitForInfinite();
    const ids = await getHeaderColumnIds({ page });

    expect(ids).toEqual([
      'group-by',

      'salary:JPY/yes',
      'age:JPY/yes',
      'total:salary:JPY',
      'total:age:JPY',
    ]);
  });

  test('column config inherit should work', async ({ page }) => {
    await page.waitForInfinite();
    const widths = await getColumnWidths(['age:JPY/yes', 'total:age:JPY'], {
      page,
    });

    expect(widths).toEqual([500, 500]);
  });
});

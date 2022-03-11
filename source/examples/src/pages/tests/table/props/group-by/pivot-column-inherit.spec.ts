import { getHeaderColumnIds, getColumnWidths } from '../../../testUtils';
import { test, expect } from '@playwright/test';

export default test.describe.parallel('Pivoting and generated columns', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/tests/table/props/group-by/pivot-column-inherit`);

    // wait for rendering
    await page.waitForSelector('[data-row-index]');
  });

  test('should generate the correct columns', async ({ page }) => {
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
    const widths = await getColumnWidths(['age:JPY/yes', 'total:age:JPY'], {
      page,
    });

    expect(widths).toEqual([500, 500]);
  });
});

import { getHeaderColumnIds } from '../../../testUtils';
import { test, expect } from '@playwright/test';

export default test.describe.parallel('Pivot and grouping edge cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/table/props/pivot/dynamic-client-side-example`);

    await page.waitForSelector('[data-column-id]');
  });

  test('expect columns to be correctly set', async ({ page }) => {
    let columnIds = await getHeaderColumnIds({ page });

    expect(columnIds).toEqual(['id', 'firstName', 'age', 'salary', 'currency']);

    await page.click('input[name="grouped"]');

    columnIds = await getHeaderColumnIds({ page });

    //because no groups are set, the cols should still be the same
    expect(columnIds).toEqual(['id', 'firstName', 'age', 'salary', 'currency']);

    await page.evaluate(() => {
      //@ts-ignore
      window.setGroupBy([{ field: 'country' }]);
    });

    await page.waitForTimeout(20);

    columnIds = await getHeaderColumnIds({ page });

    // now a group column is expected
    expect(columnIds).toEqual([
      'group-by-country',
      'id',
      'firstName',
      'age',
      'salary',
      'currency',
    ]);

    // make it also pivoted
    await page.click('input[name="pivoted"]');

    columnIds = await getHeaderColumnIds({ page });

    // now a group column and 2 agg cols are expected
    expect(columnIds).toEqual([
      'group-by-country',
      'total:salary',
      'total:age',
    ]);

    // now remove the grouped
    await page.click('input[name="grouped"]');

    columnIds = await getHeaderColumnIds({ page });

    // now only the 2 agg cols are expected
    expect(columnIds).toEqual(['total:salary', 'total:age']);

    // now remove the pivot as well to make it a simple table again
    await page.click('input[name="pivoted"]');

    expect(await getHeaderColumnIds({ page })).toEqual([
      'id',
      'firstName',
      'age',
      'salary',
      'currency',
    ]);
  });
});

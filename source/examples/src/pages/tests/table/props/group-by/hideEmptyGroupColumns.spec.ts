import { test, expect } from '@testing';

import { getHeaderColumnIds } from '../../../testUtils';

export default test.describe.parallel('hideEmptyGroupColumns', () => {
  test('should work in complex case, when we have a custom id for a group column ', async ({
    page,
  }) => {
    await page.waitForInfinite();
    await page.click('button');

    let ids = await getHeaderColumnIds({ page });

    expect(ids).toEqual([
      'group-by-department',
      'firstName',
      'country',
      'department',
    ]);

    await page.click(`[data-name="expander-icon"]`);

    await page.waitForTimeout(50);
    ids = await getHeaderColumnIds({ page });

    expect(ids).toEqual([
      'group-by-department',
      'custom-country',
      'firstName',
      'country',
      'department',
    ]);
  });

  test('should work in simple case, when we dont have a custom id for a group column ', async ({
    page,
  }) => {
    await page.waitForInfinite();
    let ids = await getHeaderColumnIds({ page });

    expect(ids).toEqual([
      'group-by-department',
      'firstName',
      'country',
      'department',
    ]);

    await page.click(`[data-name="expander-icon"]`);

    await page.waitForTimeout(50);
    ids = await getHeaderColumnIds({ page });

    expect(ids).toEqual([
      'group-by-department',
      'group-by-country',
      'firstName',
      'country',
      'department',
    ]);
  });

  test('should be able to change hideEmptyGroupColumns from true to false at runtime, and the hidden group columns should show up', async ({
    page,
  }) => {
    await page.waitForInfinite();
    await page.click('input[type="checkbox"]');

    await page.waitForTimeout(20);
    const ids = await getHeaderColumnIds({ page });

    expect(ids).toEqual([
      'group-by-department',
      'group-by-country',
      'firstName',
      'country',
      'department',
    ]);
  });
});

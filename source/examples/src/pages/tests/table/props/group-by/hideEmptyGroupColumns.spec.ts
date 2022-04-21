import { test, expect } from '@playwright/test';

import { getHeaderColumnIds } from '../../../testUtils';

export default test.describe.parallel('hideEmptyGroupColumns', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/tests/table/props/group-by/hideEmptyGroupColumns`);

    // wait for rendering
    await page.waitForSelector('[data-row-index]');
  });

  test('should work in complex case, when we have a custom id for a group column ', async ({
    page,
  }) => {
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

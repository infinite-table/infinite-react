import { getHeaderColumnIds } from '../../../testUtils';
import { test, expect } from '@playwright/test';

export default test.describe.parallel('hideEmptyGroupColumns', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `tests/table/props/group-by/hideEmptyGroupColumns-custom-group-column`,
    );

    // wait for rendering
    await page.waitForSelector('[data-row-index]');
  });

  test('should work in complex case, when we have a custom id for a group column ', async ({
    page,
  }) => {
    await page.click('button');

    let ids = await getHeaderColumnIds({ page });

    expect(ids).toEqual([
      'g-for-department',
      'firstName',
      'country',
      'department',
    ]);

    await page.click(`[data-name="expander-icon"]`);

    await page.waitForTimeout(50);
    ids = await getHeaderColumnIds({ page });

    expect(ids).toEqual([
      'g-for-department',
      'g-for-country',
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
      'g-for-department',
      'firstName',
      'country',
      'department',
    ]);

    await page.click(`[data-name="expander-icon"]`);

    await page.waitForTimeout(50);
    ids = await getHeaderColumnIds({ page });

    expect(ids).toEqual([
      'g-for-department',
      'g-for-country',
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
    let ids = await getHeaderColumnIds({ page });

    expect(ids).toEqual([
      'g-for-department',
      'g-for-country',
      'firstName',
      'country',
      'department',
    ]);
  });
});

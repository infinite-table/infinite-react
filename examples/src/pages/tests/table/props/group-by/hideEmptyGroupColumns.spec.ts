import { test, expect } from '@testing';

export default test.describe.parallel('hideEmptyGroupColumns', () => {
  test('should work in complex case, when we have a custom id for a group column ', async ({
    page,
    columnModel,
  }) => {
    await page.waitForInfinite();
    await page.click('button');

    let ids = await columnModel.getVisibleColumnIds();

    expect(ids).toEqual([
      'group-by-department',
      'firstName',
      'country',
      'department',
    ]);

    await page.click(`[data-name="expand-collapse-icon"]`);

    await page.waitForTimeout(50);
    ids = await columnModel.getVisibleColumnIds();

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
    columnModel,
  }) => {
    await page.waitForInfinite();
    let ids = await columnModel.getVisibleColumnIds();

    expect(ids).toEqual([
      'group-by-department',
      'firstName',
      'country',
      'department',
    ]);

    await page.click(`[data-name="expand-collapse-icon"]`);

    await page.waitForTimeout(50);
    ids = await columnModel.getVisibleColumnIds();

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
    columnModel,
  }) => {
    await page.waitForInfinite();
    await page.click('input[type="checkbox"]');

    await page.waitForTimeout(20);
    const ids = await columnModel.getVisibleColumnIds();

    expect(ids).toEqual([
      'group-by-department',
      'group-by-country',
      'firstName',
      'country',
      'department',
    ]);
  });
});

import { test, expect } from '@testing';

export default test.describe.parallel('Pivoting by bool values', () => {
  test('should display column header correctly when there are multiple aggregations', async ({
    page,
    columnModel,
  }) => {
    await page.waitForInfinite();

    expect(await columnModel.getVisibleColumnGroupLabels()).toEqual([
      `true`,
      `false`,
    ]);

    await page.getByText('toggle pivot by language').click();

    expect(await columnModel.getVisibleColumnGroupLabels()).toEqual([
      `true`,
      `JavaScript`,
      `TypeScript`,
      `HTML`,
      `true total`,
      `false`,
      `TypeScript`,
      `HTML`,
      `JavaScript`,
      `false total`,
    ]);
  });

  test('should display column header when only 1 aggregation is used', async ({
    page,
    columnModel,
    tableModel,
  }) => {
    await page.waitForInfinite();

    expect(await columnModel.getVisibleColumnGroupLabels()).toEqual([
      `true`,
      `false`,
    ]);

    expect(await tableModel.withHeader().getColumnHeaders()).toEqual([
      `Group by language`,
      `Group by license`,
      `Stars (sum)`,
      `License (count)`,
      `Stars (sum)`,
      `License (count)`,
    ]);

    await page.getByText('toggle multiple aggregations').click();

    expect(await tableModel.withHeader().getColumnHeaders()).toEqual([
      `Group by language`,
      `Group by license`,
      `true`,
      `false`,
    ]);

    await page.getByText('toggle pivot by language').click();

    expect(await columnModel.getVisibleColumnGroupLabels()).toEqual([
      `true`,
      `false`,
    ]);

    expect(await tableModel.withHeader().getColumnHeaders()).toEqual([
      `Group by language`,
      `Group by license`,
      `JavaScript`,
      `TypeScript`,
      `HTML`,
      `true total`,
      `TypeScript`,
      `HTML`,
      `JavaScript`,
      `false total`,
    ]);
  });
});

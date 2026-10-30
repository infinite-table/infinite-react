import { test, expect } from '@testing';

export default test.describe.parallel('Controlled sortInfo on array data', () => {
  test('without shouldReloadData, the grid sorts the data it is given', async ({
    page,
    headerModel,
    rowModel,
  }) => {
    const names = () => rowModel.getTextForColumnCells({ colId: 'name' });

    await page.waitForInfinite();
    expect(await names()).toEqual(['Bob', 'Alice', 'Carl', 'Dana', 'Eve']);

    await headerModel.clickToSortColumn({ colId: 'name' });

    // whatever order the owner passes, the grid sorts by name
    await expect
      .poll(names)
      .toEqual(['Alice', 'Bob', 'Carl', 'Dana', 'Eve']);
  });
});

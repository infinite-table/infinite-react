import { test, expect } from '@testing';

export default test.describe.parallel('Array data sorted by its owner', () => {
  test('with shouldReloadData.sortInfo, the grid keeps the order the owner passes', async ({
    page,
    headerModel,
    rowModel,
  }) => {
    const names = () => rowModel.getTextForColumnCells({ colId: 'name' });

    await page.waitForInfinite();
    expect(await names()).toEqual(['Bob', 'Alice', 'Carl', 'Dana', 'Eve']);

    await headerModel.clickToSortColumn({ colId: 'name' });

    // the owner sorts by name length - the grid does not sort again
    await expect
      .poll(names)
      .toEqual(['Bob', 'Eve', 'Carl', 'Dana', 'Alice']);
  });
});

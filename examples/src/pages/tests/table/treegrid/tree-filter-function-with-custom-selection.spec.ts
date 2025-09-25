import { test, expect } from '@testing';

export default test.describe('Tree filtering', () => {
  test('works as expected', async ({ page, treeModel, rowModel }) => {
    await page.waitForInfinite();

    await treeModel.toggleNodeSelection(2);

    let treeSelection = await page.getGlobalValue('treeSelection');

    expect(treeSelection).toEqual({
      defaultSelection: false,
      selectedPaths: [['1', '3']],
    });

    await treeModel.toggleNodeSelection(7);

    treeSelection = await page.getGlobalValue('treeSelection');

    expect(treeSelection).toEqual({
      defaultSelection: false,
      selectedPaths: [
        ['1', '3'],
        ['8', '9'],
        ['8', '10'],
      ],
    });

    await page.getByPlaceholder('Type to filter').fill('b');

    expect(await rowModel.getRenderedRowCount()).toEqual(4);

    await treeModel.toggleNodeSelection(2);

    treeSelection = await page.getGlobalValue('treeSelection');

    expect(treeSelection).toEqual({
      defaultSelection: false,
      selectedPaths: [
        ['1', '3'],
        ['1', '4', '5'],
        ['8', '9'],
        ['8', '10'],
      ],
    });
  });

  test('works as expected - scenario 2', async ({
    page,
    treeModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    await page.getByPlaceholder('Type to filter').fill('b');

    // select the "pictures" node - because of the filter, only "beach.jpg" will be selected
    await treeModel.toggleNodeSelection(2);

    await page.getByPlaceholder('Type to filter').clear();

    expect(await rowModel.getRenderedRowCount()).toEqual(10);

    let treeSelection = await page.getGlobalValue('treeSelection');

    treeSelection = await page.getGlobalValue('treeSelection');

    expect(treeSelection).toEqual({
      defaultSelection: false,
      selectedPaths: [['1', '4', '5']],
    });

    // select the pictures node again - this will also make "mountain.jpg" selected
    await treeModel.toggleNodeSelection(3);

    treeSelection = await page.getGlobalValue('treeSelection');

    expect(treeSelection).toEqual({
      defaultSelection: false,
      selectedPaths: [
        ['1', '4', '5'],
        ['1', '4', '6'],
      ],
    });

    // now if we filter again and deselect the pictures node

    await page.getByPlaceholder('Type to filter').fill('b');
    await treeModel.toggleNodeSelection(2);

    // we should only have "mountain.jpg" selected
    treeSelection = await page.getGlobalValue('treeSelection');

    expect(treeSelection).toEqual({
      defaultSelection: false,
      selectedPaths: [['1', '4', '6']],
    });
  });
});

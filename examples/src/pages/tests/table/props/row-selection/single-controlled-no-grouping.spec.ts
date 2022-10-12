import { test, expect } from '@testing';

export default test.describe.parallel('Controlled Row Selection', () => {
  test('should toggle correctly, even when no explicit selectionMode="single-row" is specified', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    let ids = await rowModel.getSelectedRowIdsForVisibleRows();

    expect(ids).toEqual(['3']);

    const cell = await rowModel.clickRow(2);

    // and pressing space key to toggle selection
    await cell.press(' ');
    ids = await rowModel.getSelectedRowIdsForVisibleRows();

    expect(ids).toEqual([]);

    // press again to reselect it
    await cell.press(' ');
    ids = await rowModel.getSelectedRowIdsForVisibleRows();

    expect(ids).toEqual(['3']);
  });
});

import { test, expect } from '@testing';

export default test.describe.parallel('Row Selection', () => {
  test('should work deselecting last row', async ({ page, rowModel }) => {
    await page.waitForInfinite();

    let ids = await rowModel.getSelectedRowIdsForVisibleRows();

    expect(ids).toEqual(['2', '3']);

    await rowModel.clickRow(4);

    ids = await rowModel.getSelectedRowIdsForVisibleRows();

    expect(ids).toEqual(['2', '3', '5']);

    // now let's deselect the last row
    await page.keyboard.press(' ');

    ids = await rowModel.getSelectedRowIdsForVisibleRows();
    expect(ids).toEqual(['2', '3']);
  });
});

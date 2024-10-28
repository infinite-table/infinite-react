import { test, expect } from '@testing';

export default test.describe('Custom collapse', () => {
  test('should work when passing an isNodeCollapsed fn', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toBe(5);

    await rowModel.toggleGroupRow(2);
    expect(await rowModel.getRenderedRowCount()).toBe(6);

    await rowModel.toggleGroupRow(2);
    expect(await rowModel.getRenderedRowCount()).toBe(5);
  });
});

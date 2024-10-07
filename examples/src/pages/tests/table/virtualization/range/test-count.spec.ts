import { test, expect } from '@testing';

export default test.describe.parallel('Virtualization - column count', () => {
  test('should actuallly render a minimum number of columns', async ({
    page,

    columnModel,
  }) => {
    await page.waitForInfinite();
    const visibleColumnIds = await columnModel.getVisibleColumnIds();
    expect(visibleColumnIds.length).toBe(4);
  });
});

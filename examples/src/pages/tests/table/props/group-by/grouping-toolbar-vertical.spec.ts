import { test, expect } from '@testing';

export default test.describe.parallel('InfiniteTable.Body', () => {
  test('should properly render the body', async ({
    page,

    rowModel,
  }) => {
    await page.waitForInfinite();

    expect(
      await rowModel.getTextForCell({
        rowIndex: 0,
        colId: 'group-by',
      }),
    ).toBe('India');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 1,
        colId: 'group-by',
      }),
    ).toBe('backend');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 2,
        colId: 'group-by',
      }),
    ).toBe('0');
  });
});

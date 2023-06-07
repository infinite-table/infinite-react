import { test, expect } from '@testing';

// this test makes sure
// https://github.com/infinite-table/infinite-react/issues/170
// is fixed
export default test.describe
  .parallel('Grouping by a field that is also aggregated, with groupCol.field defined', () => {
  test('should display the field value in non-group rows', async ({
    page,
    apiModel,
  }) => {
    await page.waitForInfinite();

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 2,
          columnId: 'group-by-team',
        });
      }),
    ).toBe('backend');
  });
});

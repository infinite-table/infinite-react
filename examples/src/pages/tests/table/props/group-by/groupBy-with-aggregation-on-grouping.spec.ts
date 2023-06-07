import { test, expect } from '@testing';

// this test makes sure
// https://github.com/infinite-table/infinite-react/issues/170
// is fixed
export default test.describe
  .parallel('Grouping by a field that is also aggregated', () => {
  test('should display the field and not the aggregation value', async ({
    page,
    apiModel,

    rowModel,
  }) => {
    await page.waitForInfinite();

    const text = await rowModel.getTextForCell({
      rowIndex: 1,
      colIndex: 1,
    });

    expect(text).toBe('backend');

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 0,
          columnId: 'group-by-department',
        });
      }),
    ).toBe('it');
    expect(
      await rowModel.getTextForCell({
        rowIndex: 0,
        colIndex: 0,
      }),
    ).toBe('it');

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 0,
          columnId: 'department',
        });
      }),
    ).toBe('it');
    expect(
      await rowModel.getTextForCell({
        rowIndex: 0,
        colId: 'department',
      }),
    ).toBe('it');

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 0,
          columnId: 'team',
        });
      }),
    ).toBe(4);
    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 1,
          columnId: 'group-by-team',
        });
      }),
    ).toBe('backend');
    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 1,
          columnId: 'department',
        });
      }),
    ).toBe('it');

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 1,
          columnId: 'team',
        });
      }),
    ).toBe('backend');

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 1,
          columnId: 'group-by-department',
        });
      }),
    ).toBe(null);

    expect(
      await rowModel.getTextForCell({
        rowIndex: 1,
        colIndex: 0,
      }),
    ).toBe('');

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 2,
          columnId: 'group-by-team',
        });
      }),
    ).toBe(null);
    expect(
      await rowModel.getTextForCell({
        rowIndex: 2,
        colIndex: 1,
      }),
    ).toBe('');
  });
});

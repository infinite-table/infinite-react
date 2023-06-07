import { test, expect } from '@testing';

export default test.describe
  .parallel('Grouping by a field, with single-group column', () => {
  test('should display cell values correctly', async ({
    page,
    apiModel,

    rowModel,
  }) => {
    await page.waitForInfinite();

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 0,
          columnId: 'group-by',
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
          columnId: 'name',
        });
      }),
    ).toBe(null);
    expect(
      await rowModel.getTextForCell({
        rowIndex: 0,
        colId: 'name',
      }),
    ).toBe('');

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
          rowIndex: 1,
          columnId: 'group-by',
        });
      }),
    ).toBe('backend');
    expect(
      await rowModel.getTextForCell({
        rowIndex: 1,
        colIndex: 0,
      }),
    ).toBe('backend');

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          rowIndex: 2,
          columnId: 'group-by',
        });
      }),
    ).toBe(null);
    expect(
      await rowModel.getTextForCell({
        rowIndex: 2,
        colIndex: 0,
      }),
    ).toBe('');
  });
});

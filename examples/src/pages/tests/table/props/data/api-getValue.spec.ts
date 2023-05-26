import { test, expect } from '@testing';

export default test.describe.parallel('api.getCellValue', () => {
  test('works with field, valueGetter and valueFormatter', async ({
    page,
    apiModel,
  }) => {
    await page.waitForInfinite();

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          columnId: 'identifier',
          rowIndex: 0,
        });
      }),
    ).toBe('0!');

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          columnId: 'age',
          rowIndex: 1,
        });
      }),
    ).toBe(20);

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValue({
          columnId: 'name',
          rowIndex: 0,
        });
      }),
    ).toBe('Name: Nya');

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValues({
          columnId: 'name',
          rowIndex: 0,
        });
      }),
    ).toEqual({
      value: 'Name: Nya',
      rawValue: 'Nya',
      formattedValue: 'Name: Nya',
    });

    expect(
      await apiModel.evaluate((api) => {
        return api.getCellValues({
          columnId: 'fullName',
          rowIndex: 0,
        });
      }),
    ).toEqual({
      value: null,
      rawValue: null,
      formattedValue: null,
    });
  });
});

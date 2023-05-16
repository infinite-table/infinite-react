import { test, expect } from '@testing';

export default test.describe.parallel('column vertical align', () => {
  test('is applied correctly', async ({ page, headerModel, rowModel }) => {
    await page.waitForInfinite();

    expect(
      await headerModel.getColumnHeaderVerticalAlign({
        colId: 'age',
      }),
    ).toBe('center');
    expect(
      await headerModel.getColumnHeaderVerticalAlign({
        colId: 'name',
      }),
    ).toBe('end');
    expect(
      await rowModel.getCellComputedStylePropertyValue(
        {
          rowIndex: 1,
          colId: 'name',
        },
        'align-items',
      ),
    ).toBe('flex-end');

    expect(
      await headerModel.getColumnHeaderVerticalAlign({
        colId: 'department',
      }),
    ).toBe('start');
    expect(
      await rowModel.getCellComputedStylePropertyValue(
        {
          rowIndex: 2,
          colId: 'department',
        },
        'align-items',
      ),
    ).toBe('center');

    expect(
      await headerModel.getColumnHeaderVerticalAlign({
        colId: 'country',
      }),
    ).toBe('end');
    expect(
      await rowModel.getCellComputedStylePropertyValue(
        {
          rowIndex: 2,
          colId: 'country',
        },
        'align-items',
      ),
    ).toBe('flex-start');
  });
});

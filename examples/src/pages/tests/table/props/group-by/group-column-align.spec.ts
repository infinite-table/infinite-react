import { test, expect } from '@testing';

export default test.describe.parallel('Group column align', () => {
  test('correctly calls column.align fn', async ({
    page,
    headerModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    expect(
      await rowModel.getCellComputedStylePropertyValue(
        {
          rowIndex: 1,
          colId: 'group-by',
        },
        'justify-content',
      ),
    ).toBe('normal');

    expect(
      await headerModel.getColumnHeaderAlign({
        colId: 'group-by',
      }),
    ).toBe('end');
    expect(
      await headerModel.getColumnHeaderAlign({
        colId: 'country',
      }),
    ).toBe('center');

    expect(
      await rowModel.getCellComputedStylePropertyValue(
        {
          colId: 'country',
          rowIndex: 0,
        },
        'justify-content',
      ),
    ).toBe('center');
    expect(
      await headerModel.getColumnHeaderAlign({
        colId: 'department',
      }),
    ).toBe('start');

    expect(
      await rowModel.getCellComputedStylePropertyValue(
        {
          rowIndex: 2,
          colId: 'group-by',
        },
        'justify-content',
      ),
    ).toBe('center');
    expect(
      await rowModel.getCellComputedStylePropertyValue(
        {
          rowIndex: 2,
          colId: 'name',
        },
        'justify-content',
      ),
    ).toBe('flex-end');
  });
});

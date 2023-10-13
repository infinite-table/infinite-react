import { expect, test } from '@testing';

export default test.describe
  .parallel('Cell Selection - getAllCellSelectionPositions', () => {
  test('should work', async ({ page, apiModel }) => {
    await page.waitForInfinite();

    const pos = await apiModel.evaluate((api) => {
      return api.cellSelectionApi.getAllCellSelectionPositions();
    });

    expect(pos).toEqual({
      columnIds: ['id', 'preferredLanguage', 'stack'],
      positions: [
        [[2, 'id'], null, null],
        [null, null, [5, 'stack']],
        [null, [8, 'preferredLanguage'], null],
      ],
    });
  });

  test('getMappedCellSelectionPositions', async ({ page, apiModel }) => {
    await page.waitForInfinite();

    const pos = await apiModel.evaluate((api) => {
      return api.cellSelectionApi.getMappedCellSelectionPositions(
        (rowInfo, colId) => {
          return `/${rowInfo.id}-${colId}`;
        },
        'x',
      );
    });

    expect(pos).toEqual({
      columnIds: ['id', 'preferredLanguage', 'stack'],
      positions: [
        ['/2-id', 'x', 'x'],
        ['x', 'x', '/5-stack'],
        ['x', '/8-preferredLanguage', 'x'],
      ],
    });
  });
});

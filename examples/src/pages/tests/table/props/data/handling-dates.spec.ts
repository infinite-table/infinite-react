import { test, expect } from '@testing';

export default test.describe.parallel('Date sorting', () => {
  test('should be correct', async ({ page, rowModel, headerModel }) => {
    await page.waitForInfinite();

    expect(
      await rowModel.getTextForColumnCells({
        colIndex: 0,
      }),
    ).toEqual([
      'Mariane',
      'Gonzalo',
      'Nya',
      'Axel',
      'Rosalind',
      'Tre',
      'Lolita',
      'Sherwood',

      'Lurline',
      'Alexandre',
    ]);

    // remove desc sort by firstName - removes sort altogether
    await headerModel.clickColumnHeader({ colIndex: 0 });
    // remove desc sort by birthDate - removes sort altogether
    await headerModel.clickColumnHeader({ colIndex: 1 });

    // add sort by birthDate asc
    await headerModel.clickColumnHeader({ colIndex: 1 });
    // toggle sort by birthDate to be desc
    await headerModel.clickColumnHeader({ colIndex: 1 });

    // should be same order above, just Tre and Lolita swapped
    expect(
      await rowModel.getTextForColumnCells({
        colIndex: 0,
      }),
    ).toEqual([
      'Mariane',
      'Gonzalo',
      'Nya',
      'Axel',
      'Rosalind',
      'Lolita',
      'Tre',
      'Sherwood',
      'Lurline',
      'Alexandre',
    ]);
  });
});

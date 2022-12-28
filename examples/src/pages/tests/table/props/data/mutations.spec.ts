import { test, expect } from '@testing';

export default test.describe.parallel('Mutations simple test', () => {
  test('api.addData and api.insertData work correctly', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toBe(5);

    await page.click('button');

    expect(
      await rowModel.getTextForCell({ rowIndex: 5, colId: 'firstName' }),
    ).toBe('Before Mark');
    expect(
      await rowModel.getTextForCell({ rowIndex: 6, colId: 'firstName' }),
    ).toBe('Mark');
    expect(await rowModel.getRenderedRowCount()).toBe(7);

    expect(
      await page.evaluate(() => (window as any).mutations.get('5')),
    ).toEqual([
      {
        position: 'after',
        primaryKey: 5,
        type: 'insert',
        data: {
          id: 6,
          firstName: 'Mark',
          lastName: 'Berg',
          age: 39,
          canDesign: 'no',
          currency: 'USD',
          preferredLanguage: 'Go',
          stack: 'frontend',
        },
      },
    ]);

    expect(
      await page.evaluate(() => (window as any).mutations.get('6')),
    ).toEqual([
      {
        position: 'before',
        primaryKey: 6,
        type: 'insert',
        data: {
          id: 7,
          firstName: 'Before Mark',
          lastName: 'Before',
          age: 39,
          canDesign: 'no',
          currency: 'USD',
          preferredLanguage: 'Go',
          stack: 'frontend',
        },
      },
    ]);
  });
});

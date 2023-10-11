import { test, expect } from '@testing';

export default test.describe.parallel('Mutations simple test', () => {
  test('editing triggers data mutations - refreshing the data does not trigger onDataMutation call', async ({
    page,
    editModel,
  }) => {
    await page.waitForInfinite();

    expect(
      await page.evaluate(() => (window as any).onDataMutationsCalls),
    ).toBe(0);

    const cell = {
      colId: 'age',
      rowIndex: 1,
    };
    await editModel.startEdit({ ...cell, event: 'enter', value: '120' });

    await editModel.confirmEdit(cell);

    await page.waitForTimeout(50);

    expect(
      await page.evaluate(() => (window as any).onDataMutationsCalls),
    ).toBe(1);

    expect(await page.evaluate(() => (window as any).mutations.get(2))).toEqual(
      [
        {
          primaryKey: 2,
          type: 'update',
          data: { id: 2, age: 120 },
          originalData: {
            id: 2,
            firstName: 'Marry',
            lastName: 'Bob',
            age: 25,
            canDesign: 'yes',
            currency: 'USD',
            preferredLanguage: 'JavaScript',
            stack: 'frontend',
            count: 0,
          },
        },
      ],
    );

    await page.getByText('Refresh data').click();
    await page.waitForTimeout(50);

    expect(
      await page.evaluate(() => (window as any).onDataMutationsCalls),
    ).toBe(1);
  });
});

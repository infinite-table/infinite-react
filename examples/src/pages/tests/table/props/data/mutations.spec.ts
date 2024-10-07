import { test, expect } from '@testing';

export default test.describe.parallel('Mutations simple test', () => {
  test('editing triggers data mutations and getValueToPersist works', async ({
    page,
    editModel,
  }) => {
    await page.waitForInfinite();
    const cell = {
      colId: 'age',
      rowIndex: 1,
    };
    await editModel.startEdit({ ...cell, event: 'enter', value: '120' });

    await editModel.confirmEdit(cell);

    await page.waitForTimeout(50);

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
          },
        },
      ],
    );

    await editModel.startEdit({ ...cell, event: 'enter', value: '234af' });

    await editModel.confirmEdit(cell);

    await page.waitForTimeout(50);

    expect(await page.evaluate(() => (window as any).mutations.get(2))).toEqual(
      [
        {
          primaryKey: 2,
          type: 'update',
          data: { id: 2, age: '234af' },
          originalData: {
            id: 2,
            firstName: 'Marry',
            lastName: 'Bob',
            age: 120,
            canDesign: 'yes',
            currency: 'USD',
            preferredLanguage: 'JavaScript',
            stack: 'frontend',
          },
        },
      ],
    );
  });

  test('api.addData and api.insertData work correctly', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toBe(5);

    await page.getByText('Add 2 items').click();

    expect(
      await rowModel.getTextForCell({ rowIndex: 5, colId: 'firstName' }),
    ).toBe('Before Mark');
    expect(
      await rowModel.getTextForCell({ rowIndex: 6, colId: 'firstName' }),
    ).toBe('Mark');
    expect(await rowModel.getRenderedRowCount()).toBe(7);

    expect(await page.evaluate(() => (window as any).mutations.get(5))).toEqual(
      [
        {
          position: 'after',
          primaryKey: 5,
          originalData: null,
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
      ],
    );

    expect(await page.evaluate(() => (window as any).mutations.get(6))).toEqual(
      [
        {
          position: 'before',
          primaryKey: 6,
          type: 'insert',
          originalData: null,
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
      ],
    );

    await page.getByText('Update id=2 to age=100').click();

    await page.waitForTimeout(50);

    expect(await page.evaluate(() => (window as any).mutations.get(2))).toEqual(
      [
        {
          primaryKey: 2,
          type: 'update',
          data: { id: 2, age: 100 },
          originalData: {
            id: 2,
            firstName: 'Marry',
            lastName: 'Bob',
            age: 25,
            canDesign: 'yes',
            currency: 'USD',
            preferredLanguage: 'JavaScript',
            stack: 'frontend',
          },
        },
      ],
    );
  });

  test('api.replaceAllData works correctly', async ({ page, rowModel }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toBe(5);

    await page.getByText('Clear all data').click();
    await page.evaluate(() => new Promise(requestAnimationFrame));

    expect(
      await page.evaluate(() => Array.from((window as any).mutations.values())),
    ).toEqual([
      [
        {
          metadata: undefined,
          primaryKey: undefined,
          type: 'clear-all',
        },
      ],
    ]);

    expect(await rowModel.getRenderedRowCount()).toBe(0);

    await page.getByText('Add 2 items').click();
    await page.evaluate(() => new Promise(requestAnimationFrame));

    expect(await rowModel.getRenderedRowCount()).toBe(2);

    expect(
      await page.evaluate(() => Array.from((window as any).mutations.values())),
    ).toEqual([
      [
        {
          position: 'after',
          primaryKey: undefined,
          originalData: null,
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
      ],
      [
        {
          position: 'before',
          primaryKey: 6,
          type: 'insert',
          originalData: null,
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
      ],
    ]);
  });
});

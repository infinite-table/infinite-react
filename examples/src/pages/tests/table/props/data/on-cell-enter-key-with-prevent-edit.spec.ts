import { test, expect } from '@testing';

export default test.describe.parallel('Prevent Enter key edit', () => {
  test('Enter key edits by default', async ({
    page,

    tableModel,
  }) => {
    await page.waitForInfinite();
    const makeCellPos = {
      colId: 'make',
      rowIndex: 0,
    };

    const cell = tableModel.withCell(makeCellPos);

    await cell.getLocator().click({ delay: 50 });

    await page.keyboard.press('Enter', {
      delay: 50,
    });
    expect(await cell.getLocator().locator('input').isVisible()).toBe(true);
    await page.keyboard.type('hello');
    await page.keyboard.press('Enter', {
      delay: 50,
    });

    expect(await cell.getValue()).toEqual('Acurahello');
  });

  test('Using onKeyDown with preventEdit', async ({
    page,

    tableModel,
  }) => {
    await page.waitForInfinite();
    const modelCellPos = {
      colId: 'model',
      rowIndex: 0,
    };

    const cell = tableModel.withCell(modelCellPos);

    const value = await cell.getValue();
    await cell.getLocator().click({ delay: 50 });

    await page.keyboard.press('Enter', {
      delay: 50,
    });
    expect(await cell.getLocator().locator('input').isVisible()).toBe(false);
    await page.keyboard.type('hello');
    await page.keyboard.press('Enter', {
      delay: 50,
    });

    expect(await cell.getValue()).toEqual(value);
  });
});

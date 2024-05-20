import { test, expect } from '@testing';

export default test.describe.parallel('Immediate edit works', () => {
  test('on lazy editable string column', async ({ page, rowModel }) => {
    await page.waitForInfinite();
    const cell = {
      colId: 'firstName',
      rowIndex: 0,
    };
    await rowModel.clickCell(cell);
    await page.keyboard.press('Enter');

    await page.waitForTimeout(200);
    const editor = page.locator('input');
    // expect the edit to not be open
    expect(await editor.count()).toBe(0);

    const cell2 = {
      colId: 'firstName',
      rowIndex: 1,
    };
    await rowModel.clickCell(cell2);

    await page.keyboard.type('a');
    await page.waitForTimeout(200);
    await page.keyboard.type('test');

    expect(await editor.count()).toBe(1);

    await page.keyboard.press('Enter');
    await editor.waitFor({
      state: 'hidden',
    });

    const text = await rowModel.getTextForCell(cell2);
    expect(text).toEqual(`atest`);
  });

  test('on number column, without delay', async ({ page, rowModel }) => {
    await page.waitForInfinite();
    const editor = page.locator('input');
    const cell = {
      colId: 'age',
      rowIndex: 0,
    };

    await rowModel.clickCell(cell);
    await page.keyboard.type('infinite table');
    await page.keyboard.press('Enter');

    await editor.waitFor({
      state: 'hidden',
    });
  });
});

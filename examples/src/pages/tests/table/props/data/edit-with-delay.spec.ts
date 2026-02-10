import { test, expect } from '@testing';

export default test.describe
  .parallel('Immediate edit works on lazy editable columns', () => {
  test('on string column', async ({ page, rowModel, tracingModel }) => {
    await page.waitForInfinite();
    const stop = await tracingModel.start();

    const editor = page.locator('input');
    const cell = {
      colId: 'firstName',
      rowIndex: 0,
    };
    await rowModel.clickCell(cell);
    await page.keyboard.press('Enter');

    await page.waitForTimeout(1100);
    // expect the edit to not be open
    expect(await editor.count()).toBe(0);

    const cell2 = {
      colId: 'firstName',
      rowIndex: 1,
    };
    await rowModel.clickCell(cell2);
    const initialText = await rowModel.getTextForCell(cell2);
    await page.keyboard.press('Enter');

    await editor.waitFor({
      state: 'visible',
    });

    await page.keyboard.type('atest');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(50);
    const text = await rowModel.getTextForCell(cell2);
    expect(text).toEqual(`${initialText}atest`);
    expect(await editor.count()).toBe(0);

    // just wait a bit more to make sure the editor is not showing again
    await page.waitForTimeout(1150);
    expect(await editor.count()).toBe(0);

    await stop();
  });
});

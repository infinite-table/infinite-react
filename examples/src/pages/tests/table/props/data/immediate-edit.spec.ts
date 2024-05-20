import { test, expect } from '@testing';

export default test.describe.parallel('Immediate edit', () => {
  test('is working on string column', async ({ page, rowModel }) => {
    await page.waitForInfinite();
    const cell = {
      colId: 'firstName',
      rowIndex: 1,
    };

    await rowModel.clickCell(cell);

    await page.keyboard.type('atest', { delay: 30 });

    await page.keyboard.press('Enter');

    await page.waitForTimeout(50);

    const text = await rowModel.getTextForCell(cell);
    expect(text).toEqual('atest');
  });

  test('is working on number column', async ({ page, rowModel }) => {
    await page.waitForInfinite();
    const cell = {
      colId: 'age',
      rowIndex: 2,
    };
    const editor = page.locator('input');

    await rowModel.clickCell(cell);

    await page.keyboard.type('765', { delay: 30 });
    await page.keyboard.press('Enter');

    await editor.waitFor({ state: 'hidden' });

    const text = await rowModel.getTextForCell(cell);
    expect(text).toEqual('765');
  });
});

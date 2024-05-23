import { test, expect, Page } from '@testing';

async function getValue(page: Page) {
  return await page.evaluate(() => (globalThis as any).combinations);
}

export default test.describe.parallel('Mutations simple test', () => {
  test('editing triggers onEditPersistSuccess with value from column.getValueToPersist', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();
    const cell = {
      colId: 'age',
      rowIndex: 1,
    };
    await rowModel.clickCell(cell);

    await page.keyboard.press('Meta+Shift+Enter');
    expect(await getValue(page)).toEqual([]);

    await page.keyboard.press('Meta+Shift+x');
    expect(await getValue(page)).toEqual([1]);

    await page.keyboard.press('Alt+Shift+ArrowLeft');
    expect(await getValue(page)).toEqual([1, 1, undefined, 1]);

    await page.keyboard.press('Alt+Shift+ArrowRight');
    expect(await getValue(page)).toEqual([1, 1, undefined, 2]);

    await page.keyboard.press('Alt+Shift+x');
    expect(await getValue(page)).toEqual([1, 1, undefined, 3]);

    await page.keyboard.press('Meta+Shift+Escape');
    expect(await getValue(page)).toEqual([1, 1, undefined, 3]);

    await page.keyboard.press('Meta+Shift+Enter');
    expect(await getValue(page)).toEqual([1, 1, undefined, 3]);

    await page.keyboard.press('Shift+PageDown');
    expect(await getValue(page)).toEqual([1, 1, 1, 3]);
  });
});

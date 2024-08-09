import { test, expect } from '@testing';

export default test.describe
  .parallel('Hover rows when zebra is off and hover is off', () => {
  test('', async ({ page, tableModel }) => {
    await page.waitForInfinite();

    const row1 = tableModel.withCell({
      rowIndex: 0,
      colIndex: 0,
    });

    const row2 = tableModel.withCell({
      rowIndex: 1,
      colIndex: 0,
    });

    const bg1row1 = await row1.getComputedStyleProperty('background-color');

    await row1.getLocator().hover();

    const bg2row1 = await row1.getComputedStyleProperty('background-color');

    expect(bg2row1).toEqual(bg1row1);

    const bg1row2 = await row2.getComputedStyleProperty('background-color');

    expect(bg1row2).toEqual(bg1row1);
  });
});

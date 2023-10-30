import { test, expect } from '@testing';

export default test.describe
  .parallel('Operators with custom filter editors', () => {
  test('work correctly', async ({ page, headerModel, rowModel }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toEqual(5);

    const locator = headerModel
      .getHeaderCellLocator({ colId: 'salary' })
      .locator('[data-operator]');

    expect(await locator.innerText()).toEqual('Not applied');

    await headerModel.clickFilterOperatorMenuItem('salary', 'low');
    expect(await locator.innerText()).toEqual('Operator low');
    expect(await rowModel.getRenderedRowCount()).toEqual(1);

    await headerModel.clickFilterOperatorMenuItem('salary', 'medium');
    expect(await locator.innerText()).toEqual('Medium');
    expect(await rowModel.getRenderedRowCount()).toEqual(3);

    await headerModel.clickFilterOperatorMenuItem('salary', 'high');
    expect(await locator.innerText()).toEqual('High');
    expect(await rowModel.getRenderedRowCount()).toEqual(1);
  });
});

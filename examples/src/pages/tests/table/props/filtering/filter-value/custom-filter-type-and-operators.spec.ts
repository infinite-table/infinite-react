import { test, expect } from '@testing';

export default test.describe
  .parallel('Custom filter type and operators', () => {
  test('works correctly', async ({ page, headerModel, rowModel }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toEqual(2);

    await headerModel
      .getHeaderCellLocator({ colId: 'age' })
      .locator('input')
      .fill('29');

    expect(await rowModel.getRenderedRowCount()).toEqual(3);

    await headerModel.clickFilterOperatorMenuItem('age', 'ltx');

    expect(await rowModel.getRenderedRowCount()).toEqual(1);

    expect(
      await rowModel.getTextForCell({
        rowIndex: 0,
        colId: 'age',
      }),
    ).toEqual('20');

    await page.click('body');
    await page.waitForTimeout(50);

    await headerModel.clickFilterOperatorMenuItem('age', 'reset');

    expect(await rowModel.getRenderedRowCount()).toEqual(5);
  });
});

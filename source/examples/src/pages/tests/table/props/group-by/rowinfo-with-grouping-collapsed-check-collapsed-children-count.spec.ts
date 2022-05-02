import { test, expect } from '@testing';

export default test.describe.parallel('RowInfo grouped', () => {
  test('rowInfo.collapsedChildrenCount be correctly set', async ({ page }) => {
    await page.waitForInfinite();

    const groupKeysForAllRows = await page.evaluate(() => {
      return (window as any).dataArray.map(
        (rowInfo: any) => rowInfo.collapsedChildrenCount,
      );
    });

    expect(groupKeysForAllRows).toEqual([
      3, // italy
      2, // italy,rome
      1, // italy,napoli
      0, //usa,
      0, //usa, la
      0, //usa, la, 50
      undefined, //leaf node
    ]);
  });
});

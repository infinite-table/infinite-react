import { test, expect, type Page } from '@testing';

async function get(page: Page) {
  return await page.evaluate(() => {
    return (window as any).timesCalled;
  });
}
export default test.describe.parallel('DataSource.data', () => {
  test('Should not be called again on sortInfo changes, when sortMode=local', async ({
    page,
    headerModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    expect(await get(page)).toBe(1);

    let ages = await rowModel.getTextForColumnCells('age');

    expect(ages).toEqual(['20', '40', '60']);

    // now click the age col to change controlled sortInfo
    await headerModel.clickColumnHeader('age');

    // but because sortMode is local
    // there should be no new data call
    expect(await get(page)).toBe(1);

    //however, the data should be sorted

    ages = await rowModel.getTextForColumnCells('age');

    expect(ages).toEqual(['20', '40', '60'].reverse());
  });

  test('should be called again on sortInfoChanges, when sortMode=remote', async ({
    page,

    headerModel,
  }) => {
    await page.waitForInfinite();

    expect(await get(page)).toBe(1);

    // this will trigger a data call
    await page.getByText('sort mode remote').click();

    expect(await get(page)).toBe(2);

    // now click the age col to change controlled sortInfo
    // which will again trigger a data call
    await headerModel.clickColumnHeader('age');

    expect(await get(page)).toBe(3);
  });
});

import {
  getRowElement,
  getRowSelector,
} from '../../../testUtils/getRowElement';
import { test, expect, Page } from '@playwright/test';

async function getRowHeight(rowIndex: number, { page }: { page: Page }) {
  try {
    const el = await getRowElement(rowIndex, { page });
    return (await el?.boundingBox())?.height;
  } catch (ex) {
    return 0;
  }
}

export default test.describe.parallel('Table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/table/props/rowHeight/basic`);

    await page.waitForSelector(getRowSelector(0));
  });

  test('row height is correct and changed accordingly with controlled prop', async ({
    page,
  }) => {
    expect(await getRowHeight(0, { page })).toEqual(40);
    expect(await getRowHeight(1, { page })).toEqual(40);

    await page.click(`[data-name="up"]`);
    expect(await getRowHeight(0, { page })).toEqual(50);

    await page.click(`[data-name="up"]`);
    expect(await getRowHeight(1, { page })).toEqual(60);

    await page.click(`[data-name="down"]`);
    await page.click(`[data-name="down"]`);
    await page.click(`[data-name="down"]`);
    expect(await getRowHeight(0, { page })).toEqual(30);

    expect(await getRowHeight(1, { page })).toEqual(30);
  });
});

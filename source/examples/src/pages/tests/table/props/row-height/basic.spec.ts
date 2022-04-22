import { test, expect, Page } from '@testing';

import { getRowElement } from '../../../testUtils/getRowElement';

async function getRowHeight(rowIndex: number, { page }: { page: Page }) {
  try {
    const el = await getRowElement(rowIndex, { page });
    return (await el?.boundingBox())?.height;
  } catch (ex) {
    return 0;
  }
}

export default test.describe.parallel('Table', () => {
  // TODO we should rewrite this test, as we no longer have rows, but only cells
  // though the test is still testing appropriately, as it's measuring the height of a cell in the row
  // so just the naming has to be updated
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

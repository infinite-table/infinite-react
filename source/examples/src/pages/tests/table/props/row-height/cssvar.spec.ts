import { test, expect, Page } from '@testing';

import { getFnCalls } from '../../../testUtils/getFnCalls';
import {
  getRowElement,
  getRowSelector,
} from '../../../testUtils/getRowElement';

async function getCalls({ page }: { page: Page }) {
  return getFnCalls('onRowHeightChange', { page });
}

async function getRowHeight(
  rowIndex: number,

  { page }: { page: Page },
) {
  try {
    const el = await getRowElement(rowIndex, { page });
    return (await el?.boundingBox())?.height;
  } catch (ex) {
    return 0;
  }
}

export default test.describe.parallel('Table', () => {
  test('row height is correct and changed accordingly via CSS variable', async ({
    page,
  }) => {
    expect(await getRowHeight(0, { page })).toEqual(40);
    expect(await getRowHeight(1, { page })).toEqual(40);

    await page.click(`[data-name="up"]`);
    await page.waitForTimeout(20);

    let calls = await getCalls({ page });
    expect(await getRowHeight(0, { page })).toEqual(50);

    //@ts-ignore
    expect(calls[calls.length - 1].args).toEqual([50]);

    await page.click(`[data-name="up"]`);
    await page.waitForTimeout(20);

    calls = await getCalls({ page });

    expect(await getRowHeight(1, { page })).toEqual(60);
    //@ts-ignore
    expect(calls[calls.length - 1].args).toEqual([60]);

    await page.click(`[data-name="down"]`);
    await page.click(`[data-name="down"]`);
    await page.click(`[data-name="down"]`);
    await page.waitForTimeout(20);

    expect(await getRowHeight(0, { page })).toEqual(30);
    expect(await getRowHeight(1, { page })).toEqual(30);
  });
});

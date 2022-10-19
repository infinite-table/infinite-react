import { test, expect, Page } from '@testing';

import { getFnCalls } from '../../../testUtils/getFnCalls';

async function getCalls({ page }: { page: Page }) {
  return getFnCalls('onRowHeightChange', { page });
}

export default test.describe.parallel('Table', () => {
  test('row height is correct and changed accordingly via CSS variable', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRowHeight(0)).toEqual(40);
    expect(await rowModel.getRowHeight(1)).toEqual(40);

    await page.click(`[data-name="up"]`);
    await page.waitForTimeout(20);

    let calls = await getCalls({ page });
    expect(await rowModel.getRowHeight(0)).toEqual(50);

    //@ts-ignore
    expect(calls[calls.length - 1].args).toEqual([50]);

    await page.click(`[data-name="up"]`);
    await page.waitForTimeout(20);

    calls = await getCalls({ page });

    expect(await rowModel.getRowHeight(1)).toEqual(60);
    //@ts-ignore
    expect(calls[calls.length - 1].args).toEqual([60]);

    await page.click(`[data-name="down"]`);
    await page.click(`[data-name="down"]`);
    await page.click(`[data-name="down"]`);
    await page.waitForTimeout(30);

    expect(await rowModel.getRowHeight(0)).toEqual(30);
    expect(await rowModel.getRowHeight(1)).toEqual(30);
  });
});

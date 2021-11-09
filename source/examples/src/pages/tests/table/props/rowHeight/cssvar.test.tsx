import { getFnCalls } from '../../../testUtils/getFnCalls';
import {
  getRowElement,
  getRowSelector,
} from '../../../testUtils/getRowElement';

const getCalls = getFnCalls('onRowHeightChange');

async function getRowHeight(rowIndex: number) {
  try {
    const el = await getRowElement(rowIndex);
    return (await el?.boundingBox())?.height;
  } catch (ex) {
    return 0;
  }
}

export default describe('Table', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/table/props/rowHeight/cssvar`);
  });

  beforeEach(async () => {
    await page.reload();
    await page.waitForSelector(getRowSelector(0));
  });

  it('row height is correct and changed accordingly via CSS variable', async () => {
    expect(await getRowHeight(0)).toEqual(40);
    expect(await getRowHeight(1)).toEqual(40);

    await page.click(`[data-name="up"]`);
    await page.waitForTimeout(20);

    let calls = await getCalls();
    expect(await getRowHeight(0)).toEqual(50);
    expect(calls[calls.length - 1].args).toEqual([50]);

    await page.click(`[data-name="up"]`);
    await page.waitForTimeout(20);

    calls = await getCalls();

    expect(await getRowHeight(1)).toEqual(60);
    expect(calls[calls.length - 1].args).toEqual([60]);

    await page.click(`[data-name="down"]`);
    await page.click(`[data-name="down"]`);
    await page.click(`[data-name="down"]`);
    await page.waitForTimeout(20);

    expect(await getRowHeight(0)).toEqual(30);
    expect(await getRowHeight(1)).toEqual(30);
  });
});

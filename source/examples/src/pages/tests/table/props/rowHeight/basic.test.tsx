import {
  getRowElement,
  getRowSelector,
} from '../../../../../utils/getRowElement';

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
    await page.goto(`${process.env.BASEURL}/table/props/rowHeight/basic`);
  });

  beforeEach(async () => {
    await page.reload();
    await page.waitForSelector(getRowSelector(0));
  });

  it('row height is correct and changed accordingly with controlled prop', async () => {
    expect(await getRowHeight(0)).toEqual(40);
    expect(await getRowHeight(1)).toEqual(40);

    await page.click(`[data-name="up"]`);
    expect(await getRowHeight(0)).toEqual(50);

    await page.click(`[data-name="up"]`);
    expect(await getRowHeight(1)).toEqual(60);

    await page.click(`[data-name="down"]`);
    await page.click(`[data-name="down"]`);
    await page.click(`[data-name="down"]`);
    expect(await getRowHeight(0)).toEqual(30);

    expect(await getRowHeight(1)).toEqual(30);
  });
});

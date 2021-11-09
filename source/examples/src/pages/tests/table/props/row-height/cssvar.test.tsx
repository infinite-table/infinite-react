import { getRowElement } from '../../../testUtils/getRowElement';

export default describe('RawList', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/table/props/row-height/cssvar`);
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('should correctly render rows', async () => {
    await page.waitForTimeout(20);

    const row = await getRowElement(1);

    const height = await page.evaluate(
      (r) => r.getBoundingClientRect().height,
      row,
    );

    expect(height).toEqual(90);
  });
});

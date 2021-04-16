import { getHeaderColumnIds } from '../../../../../utils';

export default describe('RawList', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/table/props/header/header`);
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('should correctly render virtualized header', async () => {
    await page.waitForTimeout(20);
    let cols = await getHeaderColumnIds();

    expect(cols).toEqual(['Id', 'FirstName', 'LastName', 'Age']);
    await page.click('button');

    cols = await getHeaderColumnIds();

    expect(cols).toEqual([]);
  });
});

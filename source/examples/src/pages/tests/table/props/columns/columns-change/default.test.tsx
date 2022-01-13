import { getHeaderColumnIds } from '../../../../../tests/testUtils';

export default describe('Detect columns change', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/columns/columns-change/default`,
    );
  });

  beforeEach(async () => {
    await page.reload();
  });
  it('expect columns are correctly set when updated on useEffect', async () => {
    await page.waitForSelector('[data-column-id]');

    let colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['identifier', 'firstName', 'age']);
  });
});

import { getHeaderColumnIds } from '../../../../../../utils';

export default describe('Column order uncontrolled without any default value', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/column-order/uncontrolled-without-value`,
    );
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('should display all cols', async () => {
    const colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['id', 'make', 'model', 'price', 'year', 'rating']);
  });

  it('should remove column when a new key is removed from the columns map', async () => {
    let colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['id', 'make', 'model', 'price', 'year', 'rating']);

    await page.click('button'); // hide id and make columns
    colIds = await getHeaderColumnIds();

    // expect(colIds).toEqual(['id', 'make', 'model', 'price', 'year', 'rating']);
    expect(colIds).toEqual(['model', 'price', 'year', 'rating']);
  });
});

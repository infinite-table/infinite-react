import {
  getHeaderColumnIds,
  getHeaderCellWidthByColumnId,
  getHeaderCellByColumnId,
} from '../../../../tests/testUtils';

export default describe('Detect columns change', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/table/props/column-types/default`);
  });

  beforeEach(async () => {
    await page.reload();
    await page.waitForSelector('[data-column-id]');
  });

  it('expect column types defaultWidth works correctly', async () => {
    let colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['id', 'country', 'city', 'salary']);

    const idSize = await getHeaderCellWidthByColumnId('id');
    const countrySize = await getHeaderCellWidthByColumnId('country');
    const citySize = await getHeaderCellWidthByColumnId('city');
    const salarySize = await getHeaderCellWidthByColumnId('salary');

    expect(idSize).toEqual(255);
    expect(countrySize).toEqual(400);
    expect(citySize).toEqual(155);
    expect(salarySize).toEqual(255);
  });

  it('expect column types header works correctly', async () => {
    let colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['id', 'country', 'city', 'salary']);

    const idNode = await getHeaderCellByColumnId('id');
    const salaryNode = await getHeaderCellByColumnId('salary');

    const idHeader = await idNode!.evaluate((node) => node.innerText);
    const salaryHeader = await salaryNode!.evaluate((node) => node.innerText);

    expect(idHeader).toEqual('number col');
    expect(salaryHeader).toEqual('number col');
  });
});

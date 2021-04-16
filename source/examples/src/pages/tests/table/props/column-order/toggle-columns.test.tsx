import { getHeaderColumnIds } from '../../../../../utils';
import { getRowObject } from '../../../../../utils/getRowObject';

import { rowData } from './rowData';

const expectedFirstRow = {
  id: `${rowData[0].id}`,
  make: `${rowData[0].make}`,
  year: `${rowData[0].year}`,
  price: `${rowData[0].price}`,
};
const initialColumns = ['id', 'make', 'year', 'price'];

export default describe('Column order toggle', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/column-order/toggle-columns`,
    );
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('should display all cols', async () => {
    await page.waitForTimeout(50);
    let colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(initialColumns);

    let firstRow = await getRowObject(0);
    expect(firstRow).toEqual(expectedFirstRow);

    await page.click('button');

    await page.waitForTimeout(20);
    colIds = await getHeaderColumnIds();
    expect(colIds).toEqual(['id', 'make']);
    firstRow = await getRowObject(0);
    expect(firstRow).toEqual({
      id: `${rowData[0].id}`,
      make: `${rowData[0].make}`,
    });

    await page.click('button');
    await page.waitForTimeout(20);

    colIds = await getHeaderColumnIds();
    expect(colIds).toEqual(initialColumns);

    firstRow = await getRowObject(0);
    expect(firstRow).toEqual(expectedFirstRow);
  });
});

import { CarSale } from '@examples/datasets/CarSale';

import { getCellText } from '../../../../../utils';

export default describe('Table', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/table/props/data/basic`);
    await page.waitForTimeout(10);
  });

  beforeEach(async () => {
    await page.reload();
  });
  it('cell content is there', async () => {
    const data = (await page.evaluate(
      () => (window as any).carsales,
    )) as CarSale[];

    const text = await getCellText({
      rowIndex: data.length - 2,
      columnId: 'model',
    });

    expect(text).toEqual(data[data.length - 2].model);
  });
});

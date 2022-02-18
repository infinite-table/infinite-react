import { CarSale } from '@examples/datasets/CarSale';

import { getCellText } from '../../../testUtils';

export default describe('Table', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/table/props/data/basic`);
    await page.waitForSelector('[data-row-index]');
  });

  beforeEach(async () => {
    await page.reload();
  });
  xit('cell content is there', async () => {
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

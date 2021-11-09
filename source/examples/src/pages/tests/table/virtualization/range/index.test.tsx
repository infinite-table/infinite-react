import { ElementHandle } from 'puppeteer';
import { getColumnCells } from '../../../testUtils';
import { rowData } from './rowData';

export default describe('Virtualization', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/table/virtualization/range`);
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('should display first row correctly', async () => {
    await page.waitForTimeout(50);
    let { bodyCells } = await getColumnCells('model');

    let values = await Promise.all(
      bodyCells.map(
        async (cell: ElementHandle) =>
          await cell.evaluate((node) => node.textContent),
      ),
    );

    expect(values[0]).toEqual(rowData[0].model); // Celica
  });
});

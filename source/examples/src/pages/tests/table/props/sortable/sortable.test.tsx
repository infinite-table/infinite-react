import { ElementHandle } from 'puppeteer';
import { getColumnCells } from '../../../../../utils';

export default describe('Table', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/table/props/sortable/sortable`);
  });

  beforeEach(async () => {
    await page.reload();
  });
  it('sortable=false - sorting column does not work, as table is sortable=false', async () => {
    await page.waitForTimeout(50);

    const { headerCell, bodyCells } = await getColumnCells('firstName');

    let values = await Promise.all(
      // the first one is the header
      bodyCells.map(
        async (cell: ElementHandle) =>
          await cell.evaluate((node) => node.textContent),
      ),
    );

    expect(values).toEqual(['Bob', 'Alice', 'Bill']);

    // click the column header
    await headerCell.click();

    await page.waitForTimeout(10);

    // refetch values
    values = await Promise.all(
      bodyCells.map(
        async (cell: ElementHandle) =>
          await cell.evaluate((node) => node.textContent),
      ),
    );

    expect(values).toEqual(['Bob', 'Alice', 'Bill']);
  });

  it('sortable=false - sorting column with sortable=true should work', async () => {
    await page.waitForTimeout(250);

    const { headerCell, bodyCells } = await getColumnCells('id');

    let values = await Promise.all(
      // the first one is the header
      bodyCells.map(
        async (cell: ElementHandle) =>
          await cell.evaluate((node) => node.textContent),
      ),
    );

    expect(values).toEqual(['20', '3', '10']);

    // click the column header
    await headerCell.click();

    await page.waitForTimeout(20);

    // refetch values
    values = await Promise.all(
      bodyCells.map(
        async (cell: ElementHandle) =>
          await cell.evaluate((node) => node.textContent),
      ),
    );

    expect(values).toEqual(['3', '10', '20']);
  });
});

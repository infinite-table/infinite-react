import { ElementHandle } from 'puppeteer';
import { getColumnCells } from '../../../../../utils';

export default describe('Table', () => {
  beforeAll(async () => {
    await page.goto(`${process.env.BASEURL}/table/props/sortInfo/controlled`);
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('controlled sortInfo should work properly', async () => {
    await page.waitForTimeout(50);

    const { headerCell, bodyCells } = await getColumnCells('CompanyName');

    let values = await Promise.all(
      // the first one is the header
      bodyCells.map(
        async (cell: ElementHandle) =>
          await cell.evaluate((node) => node.textContent),
      ),
    );

    expect(values).toEqual(['Abc', 'Another one', 'Because', 'Ltd company']);

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

    // expect them to be the same, since we have controlled prop
    // and no onSortInfoChange yet
    expect(values).toEqual(['Abc', 'Another one', 'Because', 'Ltd company']);

    // now click the button to enable onSortInfoChange
    await (await page.$('button'))?.click();

    await headerCell.click();

    await page.waitForTimeout(20);

    return;
    values = await Promise.all(
      // the first one is the header
      bodyCells.map(
        async (cell: ElementHandle) =>
          await cell.evaluate((node) => node.textContent),
      ),
    );

    expect(values).toEqual(['Ltd company', 'Because', 'Another one', 'Abc']);

    const {
      headerCell: orderIdHeaderCell,
      bodyCells: orderIdBodyCells,
    } = await getColumnCells('OrderId');

    // click to sort ascending
    await orderIdHeaderCell.click();
    await page.waitForTimeout(20);

    expect(
      await Promise.all(
        // the first one is the header
        orderIdBodyCells.map(
          async (cell: ElementHandle) =>
            await cell.evaluate((node) => node.textContent),
        ),
      ),
    ).toEqual(['1', '2', '3', '20']);

    // click again to sort desc
    await orderIdHeaderCell.click();
    await page.waitForTimeout(20);

    expect(
      await Promise.all(
        // the first one is the header
        orderIdBodyCells.map(
          async (cell: ElementHandle) =>
            await cell.evaluate((node) => node.textContent),
        ),
      ),
    ).toEqual(['20', '3', '2', '1']);

    // click again to unsort
    await orderIdHeaderCell.click();
    await page.waitForTimeout(20);

    expect(
      await Promise.all(
        // the first one is the header
        orderIdBodyCells.map(
          async (cell: ElementHandle) =>
            await cell.evaluate((node) => node.textContent),
        ),
      ),
    ).toEqual(['1', '20', '2', '3']);
  });
});

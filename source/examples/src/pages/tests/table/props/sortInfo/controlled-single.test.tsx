import { ElementHandle } from 'puppeteer';
import { getColumnCells } from '../../../testUtils';
import { getRowSelector } from '../../../testUtils/getRowElement';
import { getOrders, multisort } from './getOrders';

const orders = getOrders();

export default describe('Table', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/sortInfo/controlled-single`,
    );
  });

  beforeEach(async () => {
    await page.reload();
    await page.waitForSelector(getRowSelector(0));
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

    const expected = multisort(
      [{ field: 'CompanyName', dir: 1 }],
      [...orders],
    ).map((o) => o.CompanyName + '');

    expect(values).toEqual(expected);

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
    expect(values).toEqual(expected);

    // now click the button to enable onSortInfoChange
    await (await page.$('button'))?.click();

    await headerCell.click();

    await page.waitForTimeout(20);

    values = await Promise.all(
      // the first one is the header
      bodyCells.map(
        async (cell: ElementHandle) =>
          await cell.evaluate((node) => node.textContent),
      ),
    );

    expect(values).toEqual([...expected].reverse());

    const { headerCell: orderIdHeaderCell, bodyCells: orderIdBodyCells } =
      await getColumnCells('OrderId');

    // click to sort ascending
    await orderIdHeaderCell.click();
    await page.waitForTimeout(20);

    const ascById = multisort(
      [{ dir: 1, field: 'OrderId', type: 'number' }],
      [...orders],
    ).map((o) => o.OrderId + '');
    expect(
      await Promise.all(
        // the first one is the header
        orderIdBodyCells.map(
          async (cell: ElementHandle) =>
            await cell.evaluate((node) => node.textContent),
        ),
      ),
    ).toEqual(ascById);

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
    ).toEqual([...ascById].reverse());

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
    ).toEqual([...orders].map((o) => o.OrderId + ''));
  });
});

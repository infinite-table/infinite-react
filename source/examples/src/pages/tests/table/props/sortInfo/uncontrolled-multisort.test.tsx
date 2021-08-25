import { ElementHandle } from 'puppeteer';
import { getColumnCells, getGlobalFnCalls } from '../../../../../utils';
import { orders } from './orders-dataset';

const getSortInfoCallsCount = () => (window as any).sortInfos.length;
const getCalls = getGlobalFnCalls('onSortInfoChange');

export default describe('Table', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/sortInfo/uncontrolled-multisort`,
    );
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('uncontrolled sortInfo should work fine', async () => {
    await page.waitForTimeout(50);
    const { headerCell, bodyCells } = await getColumnCells('ItemCount');

    let values = await Promise.all(
      // the first one is the header
      bodyCells.map(
        async (cell: ElementHandle) =>
          await cell.evaluate((node) => node.textContent),
      ),
    );

    expect(values).toEqual(orders.map((x) => `${x.ItemCount}`));

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

    const sortedOrders = [...orders].sort((x, y) => x.ItemCount - y.ItemCount);
    expect(values).toEqual(sortedOrders.map((x) => `${x.ItemCount}`));

    // expect the onSortInfo callback to have been called once
    let calls = await getCalls();
    expect(calls.length).toEqual(1);
    // and args to have been an array (containing one object, the sortinfo for ItemCount column)
    expect(calls[0].args[0][0]).toMatchObject({
      dir: 1,
      id: 'ItemCount',
    });

    return;
    // click the column header again
    await headerCell.click();

    // expect the onSortInfo callback to have been called twice

    calls = await getCalls();
    expect(calls.length).toEqual(2);

    expect(calls[1].args[0]).toMatchObject({
      dir: -1,
      id: 'OrderId',
    });

    // refetch values
    values = await Promise.all(
      bodyCells.map(
        async (cell: ElementHandle) =>
          await cell.evaluate((node) => node.textContent),
      ),
    );

    expect(values).toEqual(['20', '3', '2', '1']);
  });
});

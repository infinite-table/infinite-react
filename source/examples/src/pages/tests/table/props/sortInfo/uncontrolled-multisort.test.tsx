import { DataSourceSingleSortInfo } from '@infinite-table/infinite-react';
import { ElementHandle } from 'puppeteer';
import { getColumnCells, getGlobalFnCalls } from '../../../testUtils';
import { getRowSelector } from '../../../testUtils/getRowElement';
import { getOrders, mapToString, multisort, Order } from './getOrders';
const orders = getOrders();

const getCalls = getGlobalFnCalls('onSortInfoChange');

export default describe('Table', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/sortInfo/uncontrolled-multisort`,
    );
  });

  beforeEach(async () => {
    await page.reload();
    await page.waitForSelector(getRowSelector(0));
  });

  it('uncontrolled sortInfo should work fine', async () => {
    const { headerCell, bodyCells } = await getColumnCells('itemCount');

    let values = await Promise.all(
      bodyCells.map(
        async (cell: ElementHandle) =>
          await cell.evaluate((node) => node.textContent),
      ),
    );

    const defaultSortInfo: DataSourceSingleSortInfo<Order>[] =
      await page.evaluate(() => (window as any).defaultSortInfo);

    const expected = mapToString(
      multisort(defaultSortInfo, [...orders]),
      'ItemCount',
    );

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

    defaultSortInfo[0].dir = -1;
    expect(values).toEqual(
      mapToString(multisort(defaultSortInfo, [...orders]), 'ItemCount'),
    );

    // expect the onSortInfo callback to have been called once
    let calls = await getCalls();
    expect(calls.length).toEqual(1);
    // and args to have been an array (containing two objects, the first one is desc sort info on ItemCount column)
    expect(calls[0].args[0]).toEqual([
      {
        dir: -1,
        field: 'ItemCount',
      },
      {
        dir: 1,
        field: 'CompanyName',
      },
    ]);

    // click the column header again
    await headerCell.click();

    // expect the onSortInfo callback to have been called twice

    calls = await getCalls();
    expect(calls.length).toEqual(2);

    // and the only sort left is by CompanyName
    expect(calls[1].args[0]).toEqual([
      {
        dir: 1,
        field: 'CompanyName',
      },
    ]);

    // refetch values
    values = await Promise.all(
      bodyCells.map(
        async (cell: ElementHandle) =>
          await cell.evaluate((node) => node.textContent),
      ),
    );

    expect(values).toEqual(
      mapToString(
        multisort(
          [
            {
              dir: 1,
              field: 'CompanyName',
            },
          ],
          [...orders],
        ),
        'ItemCount',
      ),
    );
  });
});

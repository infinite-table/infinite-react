import { getFnCalls } from '@examples/pages/tests/testUtils/getFnCalls';
import { DataSourceSingleSortInfo } from '@infinite-table/infinite-react/components/DataSource/types';
import { test, expect, ElementHandle, Page } from '@testing';

import { getColumnCells } from '../../../testUtils';

// import { getRowSelector } from '../../../testUtils/getRowElement';
import { getOrders, mapToString, multisort, Order } from './getOrders';
const orders = getOrders();

async function getCalls({ page }: { page: Page }) {
  return await getFnCalls('onSortInfoChange', { page });
}

export default test.describe.parallel('Table', () => {
  test.skip('uncontrolled sortInfo should work fine', async ({ page }) => {
    await page.waitForInfinite();
    const { headerCell, bodyCells } = await getColumnCells(
      { colId: 'itemCount' },
      {
        page,
      },
    );

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
    let calls = await getCalls({ page });
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

    calls = await getCalls({ page });
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

import { getFnCalls } from '@examples/pages/tests/testUtils/getFnCalls';
import { multisort } from '@src/utils/multisort';
import { test, expect, ElementHandle, Page } from '@testing';

import { getColumnCells } from '../../../testUtils';

import { getOrders, mapToString, Order } from './getOrders';

async function getCalls({ page }: { page: Page }) {
  return await getFnCalls('onSortInfoChange', { page });
}

const orders = getOrders();

export default test.describe.parallel('Table', () => {
  test('uncontrolled sortInfo should work fine', async ({ page }) => {
    await page.waitForInfinite();
    const { headerCell, bodyCells } = await getColumnCells('OrderId', { page });

    let values = await Promise.all(
      // the first one is the header
      bodyCells.map(
        async (cell: ElementHandle) =>
          await cell.evaluate((node) => node.textContent),
      ),
    );

    expect(values).toEqual(mapToString(orders, 'OrderId'));

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

    const expected = mapToString(
      multisort<Order>(
        [{ dir: 1, field: 'OrderId', type: 'number' }],
        [...orders],
      ),
      'OrderId',
    );

    expect(values).toEqual(expected);

    // expect the onSortInfo callback to have been called once
    let calls = await getCalls({ page });
    expect(calls.length).toEqual(1);
    expect(calls[0].args[0]).toMatchObject({
      dir: 1,
      id: 'OrderId',
    });

    // click the column header again
    await headerCell.click();

    // expect the onSortInfo callback to have been called twice

    calls = await getCalls({ page });
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

    expect(values).toEqual(
      mapToString(
        multisort<Order>(
          [
            {
              field: 'OrderId',
              dir: -1,
              type: 'number',
            },
          ],
          orders,
        ),
        'OrderId',
      ),
    );
  });
});

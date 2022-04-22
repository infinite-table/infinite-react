import { test, expect, ElementHandle } from '@testing';

import { getColumnCells } from '../../../testUtils';

import { getOrders, multisort } from './getOrders';

const orders = getOrders();

export default test.describe.parallel('Table', () => {
  test('controlled sortInfo should work properly', async ({ page }) => {
    await page.waitForTimeout(50);

    const { headerCell, bodyCells } = await getColumnCells('CompanyName', {
      page,
    });

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
    await page.locator('button').click();

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
      await getColumnCells('OrderId', { page });

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
    await orderIdHeaderCell?.click();
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

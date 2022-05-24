import { test, expect } from '@testing';

import { getColumnCells, getValuesByColumnId } from '../../../testUtils';

import { getOrders, multisort } from './getOrders';

const orders = getOrders();

export default test.describe.parallel('Table', () => {
  test('controlled sortInfo should work properly', async ({ page }) => {
    await page.waitForTimeout(50);

    const { headerCell } = await getColumnCells('CompanyName', {
      page,
    });

    let values = await getValuesByColumnId('CompanyName', { page });

    const expected = multisort(
      [{ field: 'CompanyName', dir: 1 }],
      [...orders],
    ).map((o) => o.CompanyName + '');

    expect(values).toEqual(expected);

    // click the column header
    await headerCell.click();

    await page.waitForTimeout(20);

    // refetch values
    values = await getValuesByColumnId('CompanyName', { page });

    // expect them to be the same, since we have controlled prop
    // and no onSortInfoChange yet
    expect(values).toEqual(expected);

    // now click the button to enable onSortInfoChange
    await page.locator('button').click();

    await headerCell.click();

    await page.waitForTimeout(20);
    values = await getValuesByColumnId('CompanyName', { page });

    expect(values).toEqual([...expected].reverse());

    const { headerCell: orderIdHeaderCell } = await getColumnCells('OrderId', {
      page,
    });

    // click to sort ascending
    await orderIdHeaderCell.click();
    await page.waitForTimeout(20);

    const ascById = multisort(
      [{ dir: 1, field: 'OrderId', type: 'number' }],
      [...orders],
    ).map((o) => o.OrderId + '');
    expect(await getValuesByColumnId('OrderId', { page })).toEqual(ascById);

    // click again to sort desc
    await orderIdHeaderCell?.click();
    await page.waitForTimeout(20);

    expect(await getValuesByColumnId('OrderId', { page })).toEqual(
      [...ascById].reverse(),
    );

    // click again to unsort
    await orderIdHeaderCell.click();
    await page.waitForTimeout(20);

    expect(await getValuesByColumnId('OrderId', { page })).toEqual(
      [...orders].map((o) => o.OrderId + ''),
    );
  });
});

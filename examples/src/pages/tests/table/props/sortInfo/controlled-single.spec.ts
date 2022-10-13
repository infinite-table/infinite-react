import { test, expect } from '@testing';

import { getOrders, multisort } from './getOrders';

const orders = getOrders();

export default test.describe.parallel('Table', () => {
  test('controlled sortInfo should work properly', async ({
    page,
    headerModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    let values = await rowModel.getTextForColumnCells({ colId: 'CompanyName' });

    const expected = multisort(
      [{ field: 'CompanyName', dir: 1 }],
      [...orders],
    ).map((o) => o.CompanyName + '');

    expect(values).toEqual(expected);

    // click the column header
    await headerModel.clickColumnHeader({ colId: 'CompanyName' });

    await page.waitForTimeout(20);

    // refetch values
    values = await rowModel.getTextForColumnCells({
      colId: 'CompanyName',
    });

    // expect them to be the same, since we have controlled prop
    // and no onSortInfoChange yet
    expect(values).toEqual(expected);

    // now click the button to enable onSortInfoChange
    await page.locator('button').click();

    await headerModel.clickColumnHeader({ colId: 'CompanyName' });

    await page.waitForTimeout(20);
    values = await rowModel.getTextForColumnCells({ colId: 'CompanyName' });

    expect(values).toEqual([...expected].reverse());

    await headerModel.clickColumnHeader({ colId: 'OrderId' });
    await page.waitForTimeout(20);

    const ascById = multisort(
      [{ dir: 1, field: 'OrderId', type: 'number' }],
      [...orders],
    ).map((o) => o.OrderId + '');
    expect(await rowModel.getTextForColumnCells({ colId: 'OrderId' })).toEqual(
      ascById,
    );

    // click again to sort desc
    await headerModel.clickColumnHeader({ colId: 'OrderId' });
    await page.waitForTimeout(20);

    expect(await rowModel.getTextForColumnCells({ colId: 'OrderId' })).toEqual(
      [...ascById].reverse(),
    );

    // click again to unsort
    await headerModel.clickColumnHeader({ colId: 'OrderId' });
    await page.waitForTimeout(20);

    expect(await rowModel.getTextForColumnCells({ colId: 'OrderId' })).toEqual(
      [...orders].map((o) => o.OrderId + ''),
    );
  });
});

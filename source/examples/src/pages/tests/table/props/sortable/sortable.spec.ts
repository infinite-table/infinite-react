import { test, expect, ElementHandle } from '@testing';

import { getColumnCells } from '../../../testUtils';

export default test.describe.parallel('Table', () => {
  test('sortable=false - sorting column does not work, as table is sortable=false', async ({
    page,
  }) => {
    await page.load();
    await page.waitForTimeout(50);

    const { headerCell, bodyCells } = await getColumnCells('firstName', {
      page,
    });

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

  test('sortable=false - sorting column with sortable=true should work', async ({
    page,
  }) => {
    await page.load();
    await page.waitForTimeout(50);

    const { headerCell, bodyCells } = await getColumnCells('id', { page });

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

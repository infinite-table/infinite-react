import {
  getCellText,
  getColumnWidths,
  getHeaderCellText,
} from '@examples/pages/tests/testUtils';

import { test, expect } from '@testing';

export default test.describe.parallel('Column change', () => {
  test('works correctly', async ({ page }) => {
    await page.load();
    let widths = await getColumnWidths(['firstName', 'salary', 'stack'], {
      page,
    });

    let headerText = await getHeaderCellText(
      { columnId: 'firstName' },
      { page },
    );
    let cellText = await getCellText(
      { colId: 'firstName', rowIndex: 0 },
      { page },
    );

    expect(widths).toEqual([200, 100, 100]);
    expect(headerText).toEqual('firstName');
    expect(cellText).not.toContain('!!!');

    await page.click('button');

    widths = await getColumnWidths(['firstName', 'salary', 'stack'], {
      page,
    });

    headerText = await getHeaderCellText({ columnId: 'firstName' }, { page });

    cellText = await getCellText({ colId: 'firstName', rowIndex: 0 }, { page });

    expect(widths).toEqual([500, 100, 100]);
    expect(headerText).toEqual('lastName');
    expect(cellText).toContain('!!!');
  });
});

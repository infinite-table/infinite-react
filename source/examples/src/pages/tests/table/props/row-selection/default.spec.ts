import { getSelectedRowIds } from '../../../testUtils';
import { test, expect } from '@testing';

export default test.describe.parallel('Row Selection', () => {
  test('should work with checkbox column, when there is no grouping', async ({
    page,
    rowModel,
    headerModel,
  }) => {
    await page.waitForInfinite();

    let ids = await rowModel.getSelectedRowIdsForVisibleRows();

    expect(ids).toEqual(['2', '3']);

    const cell = await rowModel.clickRow(0);

    // a click should not trigger selection, as we have a checkbox column
    ids = await getSelectedRowIds({ page });
    expect(ids).toEqual(['2', '3']);

    // but pressing space key should
    await cell.press(' ');
    ids = await rowModel.getSelectedRowIdsForVisibleRows();

    expect(ids).toEqual(['1', '2', '3']);

    await headerModel.clickSelectionCheckbox('firstName');

    ids = await rowModel.getSelectedRowIdsForVisibleRows();

    expect(ids).toEqual(['1', '2', '3', '4', '5']);

    // click the "select all" checkbox in the header again, to deselect all rows
    await headerModel.clickSelectionCheckbox('firstName');

    ids = await rowModel.getSelectedRowIdsForVisibleRows();

    expect(ids).toEqual([]);
  });
});

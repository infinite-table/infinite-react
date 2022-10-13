import {
  getColumnIdByIndex,
  getColumnOffsetById,
  resizeColumnById,
} from '@examples/pages/tests/testUtils';

import { test, expect } from '@testing';

export default test.describe.parallel('Column Resizing', () => {
  test('works correctly when there is pivot', async ({ page, columnModel }) => {
    await page.waitForInfinite();

    let sizes = (await columnModel.getColumnWidths(['group-by-country'])).list;

    expect(sizes).toEqual([220]);

    await resizeColumnById('group-by-country', -70, { page });

    sizes = (await columnModel.getColumnWidths(['group-by-country'])).list;

    expect(sizes).toEqual([150]);

    const idOfSecondColumn = await getColumnIdByIndex(
      { colIndex: 1 },
      { page },
    );

    let firstOffset = await getColumnOffsetById('group-by-country', { page });
    let secondOffset = await getColumnOffsetById(idOfSecondColumn!, { page });

    expect(firstOffset).toBe(0);
    expect(secondOffset).toBe(150);
  });
});

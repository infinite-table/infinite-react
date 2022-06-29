import {
  getColumnIdByIndex,
  getColumnOffsetById,
  getColumnWidths,
  resizeColumnById,
} from '@examples/pages/tests/testUtils';

import { test, expect } from '@testing';

export default test.describe.parallel('Column Resizing', () => {
  test('works correctly when there is pivot', async ({ page }) => {
    await page.waitForInfinite();

    let sizes = await getColumnWidths(['group-by-country'], {
      page,
    });

    expect(sizes).toEqual([220]);

    await resizeColumnById('group-by-country', -70, { page });

    sizes = await getColumnWidths(['group-by-country'], {
      page,
    });

    expect(sizes).toEqual([150]);

    const idOfSecondColumn = await getColumnIdByIndex(1, { page });

    let firstOffset = await getColumnOffsetById('group-by-country', { page });
    let secondOffset = await getColumnOffsetById(idOfSecondColumn!, { page });

    expect(firstOffset).toBe(0);
    expect(secondOffset).toBe(150);
  });
});

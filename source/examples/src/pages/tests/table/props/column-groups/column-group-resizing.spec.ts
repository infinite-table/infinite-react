import {
  getColumnWidths,
  resizeColumnGroupById,
} from '@examples/pages/tests/testUtils';

import { test, expect } from '@testing';

export default test.describe.parallel('Column Resizing', () => {
  test('works correctly and respects max limits', async ({ page }) => {
    await page.waitForInfinite();

    let sizes = await getColumnWidths(
      ['currency', 'salary', 'country', 'preferredLanguage'],
      {
        page,
      },
    );

    expect(sizes).toEqual([100, 100, 100, 100]);

    // 30px should be added to the first two, which have a maxWidth of 130 and the rest 600 should be divided among the last two
    await resizeColumnGroupById('regionalInfo', 660, { page });

    sizes = await getColumnWidths(
      ['currency', 'salary', 'country', 'preferredLanguage'],
      {
        page,
      },
    );

    expect(sizes).toEqual([130, 130, 400, 400]);
  });
});

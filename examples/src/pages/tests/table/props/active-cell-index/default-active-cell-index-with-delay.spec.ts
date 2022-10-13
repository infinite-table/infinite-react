import {
  getActiveCellIndicatorOffsetFromDOM,
  getScrollPosition,
} from '@examples/pages/tests/testUtils';

import { test, expect } from '@testing';

export default test.describe.parallel('Default active cell index', () => {
  // this test is flaky!!!
  test.skip('works correctly even with lazy data', async ({ page }) => {
    await page.waitForInfinite();

    await page.waitForTimeout(30);

    const offset = await getActiveCellIndicatorOffsetFromDOM({ page });

    const ROW_HEIGHT = 40;
    const ROW_INDEX = 80;

    // 400 to the left (2 columns)
    // 3200 vertical offset, since the row 80 is selected, so 80* rowheight40 = 3200
    expect(offset).toEqual(['400px', ROW_HEIGHT * ROW_INDEX + 'px']);

    const scrollPosition = await getScrollPosition({ page });

    // 800 is the table height
    expect(scrollPosition.scrollTop > ROW_HEIGHT * ROW_INDEX - 800).toBe(true);
  });
});

import { getScrollPosition } from '@examples/pages/tests/testUtils';

import { test, expect } from '@testing';

// TODO FIX test
export default test.describe.skip('Default active row index', () => {
  test('should determine scrolling to show the row', async ({ page }) => {
    await page.waitForInfinite(100);
    const scrollPosition = await getScrollPosition({ page });

    // 800px is the grid height, and we have 100 items * 40px
    expect(scrollPosition.scrollTop > 100 * 40 - 800).toBe(true);
  });
});

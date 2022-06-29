import { getScrollPosition } from '@examples/pages/tests/testUtils';

import { test, expect } from '@testing';

export default test.describe.parallel('Default active row index', () => {
  test('should determine scrolling to show the row', async ({ page }) => {
    await page.waitForInfinite();

    const scrollPosition = await getScrollPosition({ page });

    // 800px is the grid height, and we have 100 items * 40px
    expect(scrollPosition.scrollTop > 100 * 40 - 800).toBe(true);
  });
});

import { getScrollPosition } from '@examples/pages/tests/testUtils';

import { test, expect } from '@testing';

export default test.describe('Default active row index', () => {
  test('should determine scrolling to show the row', async ({ page }) => {
    await page.waitForInfinite(100);
    let scrollPosition = await getScrollPosition({ page });

    // 800px is the grid height, and we have 100 items * 40px
    expect(scrollPosition.scrollTop > 100 * 40 - 800).toBe(true);

    await page.click('button');

    scrollPosition = await getScrollPosition({ page });
    expect(scrollPosition.scrollLeft).toBe(100);

    const activeRowIndicator = await page.locator(
      '[data-name="active-row-indicator"]',
    );

    const transform = await activeRowIndicator.evaluate((node) => {
      return window.getComputedStyle(node).getPropertyValue('transform');
    });

    const xPos = transform.split(',')[4].trim();

    expect(xPos).toBe('0');
  });
});

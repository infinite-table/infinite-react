import { getScrollerLocator } from '@examples/pages/tests/testUtils';

import { test, expect } from '@testing';

export default test.describe('No scrollbar grid', () => {
  test('should not have scrollbars induced by the active row index selector', async ({
    page,
  }) => {
    await page.waitForInfinite();
    const scroller = await getScrollerLocator({ page });

    const { scrollWidth, scrollHeight, offsetWidth } = await scroller.evaluate(
      (node) => {
        return {
          scrollWidth: (node as HTMLElement).scrollWidth,
          scrollHeight: (node as HTMLElement).scrollHeight,
          offsetWidth: (node as HTMLElement).offsetWidth,
        };
      },
    );

    expect(scrollHeight).toEqual(120);
    expect(scrollWidth).toEqual(800);
    expect(offsetWidth).toEqual(800);
  });
});

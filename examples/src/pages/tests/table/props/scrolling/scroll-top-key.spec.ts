import { getScrollPosition, getScrollerLocator } from '../../../testUtils';

import { test, expect } from '@testing';

export default test.describe.parallel('scrollTopKey', () => {
  test('a new key scrolls the grid back to the top', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const scroller = await getScrollerLocator({ page });

    await scroller.evaluate((node) => {
      node.scrollTop = 4000;
    });
    await expect
      .poll(async () => (await getScrollPosition({ page })).scrollTop)
      .toBe(4000);
    // the rows at the scroll position are rendered
    await expect
      .poll(() => rowModel.getTextForCell({ rowIndex: 100, colId: 'name' }))
      .toBe('Item 100');

    await page.locator('[data-name="scroll-to-top"]').click();

    await expect
      .poll(async () => (await getScrollPosition({ page })).scrollTop)
      .toBe(0);
    await expect
      .poll(() => rowModel.getTextForCell({ rowIndex: 0, colId: 'name' }))
      .toBe('Item 0');

    // and again, after scrolling down a second time
    await scroller.evaluate((node) => {
      node.scrollTop = 2000;
    });
    await expect
      .poll(async () => (await getScrollPosition({ page })).scrollTop)
      .toBe(2000);

    await page.locator('[data-name="scroll-to-top"]').click();

    await expect
      .poll(async () => (await getScrollPosition({ page })).scrollTop)
      .toBe(0);
  });
});

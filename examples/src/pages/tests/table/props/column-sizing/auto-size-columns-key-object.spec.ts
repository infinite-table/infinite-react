import { getColumnWidths, getScrollerLocator } from '../../../testUtils';

import { test, expect } from '@testing';

export default test.describe.parallel('autoSizeColumnsKey as an object', () => {
  test('sizes the columns once per key, not on every render range change', async ({
    page,
  }) => {
    await page.waitForInfinite();

    const getIdWidth = async () => (await getColumnWidths(['id'], { page }))[0];

    expect(await getIdWidth()).toBe(200);

    await page.locator('[data-name="auto-size"]').click();

    // the id column fits its content (at most 3 digits)
    await expect.poll(getIdWidth).toBeLessThan(100);

    // a width set after the auto-size stays
    await page.locator('[data-name="set-width"]').click();
    await expect.poll(getIdWidth).toBe(300);

    // including while scrolling, which changes the render range
    const scroller = await getScrollerLocator({ page });
    for (const scrollTop of [2000, 4000, 8000]) {
      await scroller.evaluate((node, top) => {
        node.scrollTop = top;
      }, scrollTop);
      await page.waitForTimeout(100);
      expect(await getIdWidth()).toBe(300);
    }

    // a new key sizes the column again
    await page.locator('[data-name="auto-size"]').click();
    await expect.poll(getIdWidth).toBeLessThan(100);
  });
});

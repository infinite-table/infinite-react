import { test, expect, Page } from '@testing';

import { getItem, getList, getLog, getOrder } from './dragListUtils';

const getScrollTop = (page: Page) =>
  getList(page, 'long').evaluate((node) => node.scrollTop);

// the list is 200px high and has 30 items of 40px
const MAX_SCROLL_TOP = 1000;

const LONG_ITEMS = Array.from({ length: 30 }, (_, index) => `item-${index}`);

/**
 * The auto-scroll speeds up with time (it starts at 1px per frame and
 * reaches its full speed after 1.2 seconds), so how long it takes depends
 * on the frame rate. The tests don't measure that: they hold the pointer at
 * the edge until the list has scrolled all the way, however long it takes,
 * and check where the item is dropped.
 */
export default test.describe('DragList - auto-scroll at the edge of a scrolling list', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(30_000);

    await page.load();
    await getList(page, 'long').waitFor();
  });

  test('holding an item at the bottom edge scrolls the list, and the item is dropped where the list scrolled to', async ({
    page,
  }) => {
    const listBox = (await getList(page, 'long').boundingBox())!;
    const first = getItem(page, 'long', 'item-0');
    const box = (await first.boundingBox())!;
    const start = { x: box.x + 100, y: box.y + 20 };

    expect(await getScrollTop(page)).toBe(0);

    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    // 5px above the bottom edge of the list
    await page.mouse.move(start.x, listBox.y + listBox.height - 5, {
      steps: 5,
    });

    await expect
      .poll(() => getScrollTop(page), { timeout: 20_000 })
      .toBe(MAX_SCROLL_TOP);

    await page.mouse.up();

    // the first item is now the last one
    await expect
      .poll(() => getOrder(page, 'long'))
      .toEqual([...LONG_ITEMS.slice(1), 'item-0']);

    expect(await getLog(page)).toEqual([
      { name: 'long.onDrop', dragIndex: 0, dropIndex: 30 },
    ]);
  });

  test('the pointer in the middle of the list does not scroll it', async ({
    page,
  }) => {
    const first = getItem(page, 'long', 'item-0');
    const box = (await first.boundingBox())!;
    const start = { x: box.x + 100, y: box.y + 20 };

    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    // the middle of the list: more than 25% of its height away from an edge
    await page.mouse.move(start.x, start.y + 80, { steps: 5 });

    // longer than the time in which the scroll is slowed down
    await page.waitForTimeout(500);

    expect(await getScrollTop(page)).toBe(0);

    await page.mouse.up();

    await expect
      .poll(() => getOrder(page, 'long'))
      .toEqual(['item-1', 'item-2', 'item-0', ...LONG_ITEMS.slice(3)]);
  });

  test('an item of another list, held at the bottom edge, scrolls the target list and is dropped at its end', async ({
    page,
  }) => {
    const listBox = (await getList(page, 'long').boundingBox())!;
    const item = getItem(page, 'short', 'new-1');
    const box = (await item.boundingBox())!;
    const start = { x: box.x + 100, y: box.y + 20 };

    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(listBox.x + 100, listBox.y + listBox.height - 5, {
      steps: 5,
    });

    await expect
      .poll(() => getScrollTop(page), { timeout: 20_000 })
      .toBe(MAX_SCROLL_TOP);

    await page.mouse.up();

    await expect
      .poll(() => getOrder(page, 'long'))
      .toEqual([...LONG_ITEMS, 'new-1']);
    expect(await getOrder(page, 'short')).toEqual(['new-2']);

    expect(await getLog(page)).toEqual([
      {
        name: 'long.onAcceptDrop',
        dragItemId: 'new-1',
        dragSourceListId: 'short',
        dropTargetListId: 'long',
        dragIndex: 0,
        dropIndex: 30,
      },
      { name: 'short.onRemove', dragItemId: 'new-1' },
    ]);
  });
});

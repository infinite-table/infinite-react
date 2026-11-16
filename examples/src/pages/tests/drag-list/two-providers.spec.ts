import { test, expect, Page } from '@testing';

import {
  dragBy,
  getInlineTransform,
  getItem,
  getList,
  getLog,
  getOrder,
} from './dragListUtils';

// the lists are 200px wide, with 50px between them
const TO_THE_OTHER_LIST = 250;

/**
 * No item of the list is the dragged one and none was moved to make room.
 */
async function expectListUntouched(page: Page, listName: string) {
  for (const id of ['a', 'b', 'c']) {
    const item = getItem(page, listName, id);

    await expect(item).not.toHaveClass(/DraggableItem--active/);
    await expect(item).toHaveCSS('visibility', 'visible');
    // no transform, or the one a list leaves on its items after a drop
    expect(['', 'none']).toContain(await getInlineTransform(item));
  }
}

export default test.describe('DragList - two providers on a page', () => {
  test.beforeEach(async ({ page }) => {
    await page.load();
    await getList(page, 'first').waitFor();
    await getList(page, 'second').waitFor();
  });

  test('a drag in the list of one provider does not touch the list of the other', async ({
    page,
  }) => {
    // the two lists have items with the same ids
    await dragBy(
      page,
      getItem(page, 'first', 'a'),
      { x: 0, y: 50 },
      async () => {
        await expect(getItem(page, 'first', 'a')).toHaveClass(
          /DraggableItem--active/,
        );
        await expectListUntouched(page, 'second');
      },
    );

    await expect.poll(() => getOrder(page, 'first')).toEqual(['b', 'a', 'c']);
    expect(await getOrder(page, 'second')).toEqual(['a', 'b', 'c']);
    expect(await getLog(page)).toEqual([
      { name: 'first.onDrop', dragItemId: 'a' },
    ]);

    // and the other way around
    await dragBy(
      page,
      getItem(page, 'second', 'c'),
      { x: 0, y: -50 },
      async () => {
        await expect(getItem(page, 'second', 'c')).toHaveClass(
          /DraggableItem--active/,
        );
        await expectListUntouched(page, 'first');
      },
    );

    await expect.poll(() => getOrder(page, 'second')).toEqual(['a', 'c', 'b']);
    expect(await getOrder(page, 'first')).toEqual(['b', 'a', 'c']);
    expect(await getLog(page)).toEqual([
      { name: 'first.onDrop', dragItemId: 'a' },
      { name: 'second.onDrop', dragItemId: 'c' },
    ]);
  });

  test('an item dropped over the list of the other provider is not accepted by it', async ({
    page,
  }) => {
    await dragBy(
      page,
      getItem(page, 'first', 'b'),
      { x: TO_THE_OTHER_LIST, y: 0 },
      async () => {
        await expectListUntouched(page, 'second');
      },
    );

    // for its own list, the item was dropped outside
    await expect.poll(() => getOrder(page, 'first')).toEqual(['a', 'c']);
    expect(await getOrder(page, 'second')).toEqual(['a', 'b', 'c']);
    expect(await getLog(page)).toEqual([
      { name: 'first.onRemove', dragItemId: 'b' },
    ]);

    // the second list still works after it
    await dragBy(page, getItem(page, 'second', 'a'), { x: 0, y: 50 });

    await expect.poll(() => getOrder(page, 'second')).toEqual(['b', 'a', 'c']);
  });
});

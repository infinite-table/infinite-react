import { test, expect, Page } from '@testing';

import {
  dragBy,
  getInlineTransform,
  getItem,
  getList,
  getLog,
  getOrder,
} from './dragListUtils';

const getJSON = async (page: Page, name: string) =>
  JSON.parse(await page.locator(`[data-name="${name}"]`).innerText());

const IDLE = {
  dragSourceListId: null,
  dropTargetListId: null,
  dragItemId: '',
  status: 'accepted',
};

// the lists are 200px wide, with 50px between them
const TO_THE_OTHER_LIST = 250;

export default test.describe('DragList - two lists under one provider', () => {
  test.beforeEach(async ({ page }) => {
    await page.load();
    await getList(page, 'left').waitFor();
  });

  test('an item dragged to the other list is removed from its list and accepted by the other', async ({
    page,
  }) => {
    // "a" is dropped between "x" and "y"
    await dragBy(page, getItem(page, 'left', 'a'), {
      x: TO_THE_OTHER_LIST,
      y: 40,
    });

    await expect.poll(() => getOrder(page, 'left')).toEqual(['b', 'c']);
    expect(await getOrder(page, 'right')).toEqual(['x', 'a', 'y', 'z']);

    // the target is told first, then the source
    expect(await getLog(page)).toEqual([
      {
        name: 'right.onAcceptDrop',
        dragItemId: 'a',
        dragSourceListId: 'left',
        dropTargetListId: 'right',
        dragIndex: 0,
        dropIndex: 1,
        dropItemId: 'y',
      },
      {
        name: 'left.onRemove',
        sortedIndexes: [1, 2],
        dragIndex: 0,
        dropIndex: -1,
        dragItemId: 'a',
      },
    ]);

    // and it can go back, to the end of its first list
    await dragBy(page, getItem(page, 'right', 'a'), {
      x: -TO_THE_OTHER_LIST,
      y: 60,
    });

    await expect.poll(() => getOrder(page, 'left')).toEqual(['b', 'c', 'a']);
    expect(await getOrder(page, 'right')).toEqual(['x', 'y', 'z']);
  });

  test('the provider and the lists know the source and the target while dragging', async ({
    page,
  }) => {
    expect(await getJSON(page, 'provider-state')).toEqual(IDLE);
    expect(await getJSON(page, 'list-state-right')).toEqual({
      dragListId: 'right',
      draggingInProgress: false,
      dragSourceListId: null,
      dropTargetListId: null,
    });

    const a = getItem(page, 'left', 'a');
    const box = (await a.boundingBox())!;
    const start = { x: box.x + 100, y: box.y + 20 };

    await page.mouse.move(start.x, start.y);
    await page.mouse.down();

    // still in its own list
    await page.mouse.move(start.x, start.y + 10, { steps: 2 });

    await expect
      .poll(() => getJSON(page, 'provider-state'))
      .toEqual({
        dragSourceListId: 'left',
        dropTargetListId: 'left',
        dragItemId: 'a',
        status: 'accepted',
      });

    // over the other list
    await page.mouse.move(start.x + TO_THE_OTHER_LIST, start.y + 40, {
      steps: 5,
    });

    await expect
      .poll(() => getJSON(page, 'provider-state'))
      .toEqual({
        dragSourceListId: 'left',
        dropTargetListId: 'right',
        dragItemId: 'a',
        status: 'accepted',
      });

    await expect
      .poll(() => getJSON(page, 'list-state-left'))
      .toEqual({
        dragListId: 'left',
        draggingInProgress: true,
        dragSourceListId: 'left',
        dropTargetListId: 'right',
      });
    await expect
      .poll(() => getJSON(page, 'list-state-right'))
      .toEqual({
        dragListId: 'right',
        draggingInProgress: true,
        dragSourceListId: 'left',
        dropTargetListId: 'right',
      });

    await expect(a).toHaveClass(/DraggableItem--active/);
    await expect(getList(page, 'left')).toHaveClass(/DragList--dragging/);
    await expect(getList(page, 'right')).toHaveClass(/DragList--dragging/);

    // the target makes room at the drop position
    expect(await getInlineTransform(getItem(page, 'right', 'x'))).toBe(
      'translate3d(0px, 0px, 0px)',
    );
    expect(await getInlineTransform(getItem(page, 'right', 'y'))).toBe(
      'translate3d(0px, 40px, 0px)',
    );
    expect(await getInlineTransform(getItem(page, 'right', 'z'))).toBe(
      'translate3d(0px, 40px, 0px)',
    );

    // and the source closes the gap
    expect(await getInlineTransform(getItem(page, 'left', 'b'))).toBe(
      'translate3d(0px, -40px, 0px)',
    );

    await page.mouse.up();

    await expect.poll(() => getJSON(page, 'provider-state')).toEqual(IDLE);
    await expect
      .poll(() => getJSON(page, 'list-state-right'))
      .toEqual({
        dragListId: 'right',
        draggingInProgress: false,
        dragSourceListId: null,
        dropTargetListId: null,
      });

    for (const id of ['x', 'y', 'z']) {
      expect(await getInlineTransform(getItem(page, 'right', id))).toBe('none');
    }
  });

  test('a list that accepts drops from itself can still be reordered', async ({
    page,
  }) => {
    await dragBy(page, getItem(page, 'right', 'x'), { x: 0, y: 50 });

    await expect.poll(() => getOrder(page, 'right')).toEqual(['y', 'x', 'z']);
    expect(await getOrder(page, 'left')).toEqual(['a', 'b', 'c']);

    expect((await getLog(page)).map((call) => call.name)).toEqual([
      'right.onDrop',
    ]);
  });

  test('an item dropped outside both lists is removed from its list', async ({
    page,
  }) => {
    await dragBy(page, getItem(page, 'left', 'b'), { x: 0, y: 400 });

    await expect.poll(() => getOrder(page, 'left')).toEqual(['a', 'c']);
    expect(await getOrder(page, 'right')).toEqual(['x', 'y', 'z']);

    expect(await getLog(page)).toEqual([
      {
        name: 'left.onRemove',
        sortedIndexes: [0, 2],
        dragIndex: 1,
        dropIndex: -1,
        dragItemId: 'b',
      },
    ]);
  });
});

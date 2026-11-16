import { test, expect } from '@testing';

import {
  cancelPointer,
  dragBy,
  getDefaultProxy,
  getInlineTransform,
  getItem,
  getList,
  getLog,
  getOrder,
  loadDragListPage,
  selectTextOf,
} from './dragListUtils';

export default test.describe('DragList - reordering the items of a list', () => {
  test.beforeEach(async ({ page }) => {
    await loadDragListPage(page);
  });

  test('the list and its items get the drag attributes and classNames', async ({
    page,
  }) => {
    const list = getList(page, 'vertical');
    const item = getItem(page, 'vertical', 'two');

    await expect(list).toHaveAttribute('data-drag-list-id', 'vertical');
    await expect(list).toHaveClass(/(^|\s)DragList(\s|$)/);
    await expect(list).not.toHaveClass(/DragList--dragging/);

    await expect(item).toHaveAttribute('data-drag-item-list-id', 'vertical');
    await expect(item).toHaveClass(/(^|\s)DraggableItem(\s|$)/);
    await expect(item).not.toHaveClass(/DraggableItem--active/);
  });

  test('dragging an item down moves it after the items it passed', async ({
    page,
  }) => {
    // the items are 40px high: "one" goes below "three"
    await dragBy(page, getItem(page, 'vertical', 'one'), { x: 0, y: 90 });

    await expect
      .poll(() => getOrder(page, 'vertical'))
      .toEqual(['two', 'three', 'one', 'four', 'five']);

    expect(await getLog(page)).toEqual([
      {
        name: 'vertical.onDrop',
        sortedIndexes: [1, 2, 0, 3, 4],
        dragIndex: 0,
        dropIndex: 3,
        dragItemId: 'one',
        dropItemId: 'four',
      },
    ]);
  });

  test('dragging an item up moves it before the items it passed', async ({
    page,
  }) => {
    await dragBy(page, getItem(page, 'vertical', 'five'), { x: 0, y: -90 });

    await expect
      .poll(() => getOrder(page, 'vertical'))
      .toEqual(['one', 'two', 'five', 'three', 'four']);

    expect(await getLog(page)).toEqual([
      {
        name: 'vertical.onDrop',
        sortedIndexes: [0, 1, 4, 2, 3],
        dragIndex: 4,
        dropIndex: 2,
        dragItemId: 'five',
        dropItemId: 'three',
      },
    ]);
  });

  test('while dragging, a proxy follows the pointer and the other items make room', async ({
    page,
  }) => {
    const list = getList(page, 'vertical');
    const one = getItem(page, 'vertical', 'one');
    const proxy = getDefaultProxy(page);

    await expect(proxy).toHaveCount(0);

    const initialBox = (await one.boundingBox())!;

    await dragBy(page, one, { x: 10, y: 90 }, async () => {
      await expect(list).toHaveClass(/DragList--dragging/);
      await expect(one).toHaveClass(/DraggableItem--active/);
      await expect(getItem(page, 'vertical', 'two')).not.toHaveClass(
        /DraggableItem--active/,
      );

      // the proxy is a clone of the item, in the body, moved by the pointer
      await expect(proxy).toHaveCount(1);
      await expect(proxy).toHaveText('one');
      await expect(proxy).toHaveCSS('position', 'fixed');

      const proxyBox = (await proxy.boundingBox())!;
      expect(Math.round(proxyBox.x - initialBox.x)).toBe(10);
      expect(Math.round(proxyBox.y - initialBox.y)).toBe(90);

      // while the item itself stays in place, hidden
      await expect(one).toHaveCSS('visibility', 'hidden');

      // the items it passed move up by the height of the dragged item
      expect(await getInlineTransform(getItem(page, 'vertical', 'two'))).toBe(
        'translate3d(0px, -40px, 0px)',
      );
      expect(await getInlineTransform(getItem(page, 'vertical', 'three'))).toBe(
        'translate3d(0px, -40px, 0px)',
      );
      expect(await getInlineTransform(getItem(page, 'vertical', 'four'))).toBe(
        'translate3d(0px, 0px, 0px)',
      );
    });

    await expect(proxy).toHaveCount(0);
    await expect(list).not.toHaveClass(/DragList--dragging/);
    await expect(one).not.toHaveClass(/DraggableItem--active/);
    await expect(one).toHaveCSS('visibility', 'visible');

    for (const id of ['one', 'two', 'three', 'four', 'five']) {
      expect(await getInlineTransform(getItem(page, 'vertical', id))).toBe(
        'none',
      );
    }
  });

  test('a click on an item, with no pointer move, is not a drag', async ({
    page,
  }) => {
    const two = getItem(page, 'vertical', 'two');
    const box = (await two.boundingBox())!;

    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.down();

    await expect(getDefaultProxy(page)).toHaveCount(0);
    await expect(getList(page, 'vertical')).not.toHaveClass(
      /DragList--dragging/,
    );

    await page.mouse.up();

    expect(await getLog(page)).toEqual([]);
    expect(await getOrder(page, 'vertical')).toEqual([
      'one',
      'two',
      'three',
      'four',
      'five',
    ]);

    // and the list still works after it
    await dragBy(page, two, { x: 0, y: 50 });

    await expect
      .poll(() => getOrder(page, 'vertical'))
      .toEqual(['one', 'three', 'two', 'four', 'five']);
  });

  test('an item dropped back on its own place calls onDrop with the same order', async ({
    page,
  }) => {
    await dragBy(page, getItem(page, 'vertical', 'two'), { x: 0, y: 10 });

    await expect.poll(async () => (await getLog(page)).length).toBe(1);

    expect((await getLog(page))[0].sortedIndexes).toEqual([0, 1, 2, 3, 4]);
    expect(await getOrder(page, 'vertical')).toEqual([
      'one',
      'two',
      'three',
      'four',
      'five',
    ]);
  });

  test('a horizontal list with the inline strategy moves the item itself', async ({
    page,
  }) => {
    const a = getItem(page, 'horizontal', 'a');

    // the items are 80px wide: "a" goes after "c"
    await dragBy(page, a, { x: 170, y: 0 }, async () => {
      await expect(getDefaultProxy(page)).toHaveCount(0);
      await expect(a).toHaveCSS('visibility', 'visible');

      expect(await getInlineTransform(a)).toBe('translate3d(170px, 0px, 0px)');
      expect(await getInlineTransform(getItem(page, 'horizontal', 'b'))).toBe(
        'translate3d(-80px, 0px, 0px)',
      );
    });

    await expect
      .poll(() => getOrder(page, 'horizontal'))
      .toEqual(['b', 'c', 'a', 'd']);

    expect(await getLog(page)).toEqual([
      {
        name: 'horizontal.onDrop',
        sortedIndexes: [1, 2, 0, 3],
        dragIndex: 0,
        dropIndex: 3,
        dragItemId: 'a',
        dropItemId: 'd',
      },
    ]);

    // the other lists are not affected
    expect(await getOrder(page, 'vertical')).toEqual([
      'one',
      'two',
      'three',
      'four',
      'five',
    ]);
  });

  test('with a drag handle, only the handle starts a drag', async ({
    page,
  }) => {
    const first = getItem(page, 'with-handle', '1');

    // dragging the item by its label does nothing
    await dragBy(page, first.locator('[data-name="label"]'), { x: 0, y: 50 });

    expect(await getLog(page)).toEqual([]);
    expect(await getOrder(page, 'with-handle')).toEqual(['1', '2', '3']);

    await dragBy(page, first.locator('[data-name="handle"]'), { x: 0, y: 50 });

    await expect
      .poll(() => getOrder(page, 'with-handle'))
      .toEqual(['2', '1', '3']);

    expect(await getLog(page)).toEqual([
      {
        name: 'with-handle.onDrop',
        sortedIndexes: [1, 0, 2],
        dragIndex: 0,
        dropIndex: 2,
        dragItemId: '1',
        dropItemId: '3',
      },
    ]);
  });

  // In Chrome on Linux, a press on selected text starts the browser's own
  // drag of that text, which takes the pointer away from the page
  test('a drag that starts on selected text moves the item', async ({
    page,
  }) => {
    await selectTextOf(page, 'vertical');

    expect(
      await page.evaluate(() => window.getSelection()!.toString()),
    ).toContain('one');

    await dragBy(page, getItem(page, 'vertical', 'one'), { x: 0, y: 90 });

    await expect
      .poll(() => getOrder(page, 'vertical'))
      .toEqual(['two', 'three', 'one', 'four', 'five']);

    expect(await getLog(page)).toEqual([
      {
        name: 'vertical.onDrop',
        sortedIndexes: [1, 2, 0, 3, 4],
        dragIndex: 0,
        dropIndex: 3,
        dragItemId: 'one',
        dropItemId: 'four',
      },
    ]);
    await expect(getList(page, 'vertical')).not.toHaveClass(
      /DragList--dragging/,
    );
  });

  test('a drag whose pointer is cancelled puts the item back and calls nothing', async ({
    page,
  }) => {
    const list = getList(page, 'vertical');
    const one = getItem(page, 'vertical', 'one');
    const ids = ['one', 'two', 'three', 'four', 'five'];

    await dragBy(page, one, { x: 0, y: 90 }, async () => {
      await expect(getDefaultProxy(page)).toHaveCount(1);
      await expect(list).toHaveClass(/DragList--dragging/);

      await cancelPointer(page);

      // the drag is over, with the pointer still down
      await expect(getDefaultProxy(page)).toHaveCount(0);
      await expect(list).not.toHaveClass(/DragList--dragging/);
      await expect(one).not.toHaveClass(/DraggableItem--active/);
      await expect(one).toHaveCSS('visibility', 'visible');

      for (const id of ids) {
        await expect
          .poll(() => getInlineTransform(getItem(page, 'vertical', id)))
          .toBe('none');
      }
    });

    // and the release after it is not a drop
    expect(await getLog(page)).toEqual([]);
    expect(await getOrder(page, 'vertical')).toEqual(ids);

    // the list still works after it
    await dragBy(page, getItem(page, 'vertical', 'five'), { x: 0, y: -90 });

    await expect
      .poll(() => getOrder(page, 'vertical'))
      .toEqual(['one', 'two', 'five', 'three', 'four']);
  });
});

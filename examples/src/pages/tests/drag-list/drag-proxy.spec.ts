import { test, expect } from '@testing';

import {
  dragBy,
  getDefaultProxy,
  getInlineTransform,
  getItem,
  getLog,
  getOrder,
  loadDragListPage,
} from './dragListUtils';

export default test.describe('DragList - the drag proxy', () => {
  test.beforeEach(async ({ page }) => {
    await loadDragListPage(page);
  });

  test('renderDragProxy renders the proxy, and gets where the pointer has moved it', async ({
    page,
  }) => {
    const proxy = page.locator('[data-name="rendered-proxy"]');
    const a = getItem(page, 'rendered', 'a');
    const initialBox = (await a.boundingBox())!;

    await expect(proxy).toHaveCount(0);

    await dragBy(page, a, { x: 10, y: 50 }, async () => {
      await expect(proxy).toHaveCount(1);
      await expect(proxy).toHaveText('dragging a');

      // it is in the body, not in the list
      expect(
        await proxy.evaluate((node) => node.parentElement === document.body),
      ).toBe(true);

      await expect
        .poll(async () => {
          const box = (await proxy.boundingBox())!;

          return {
            x: Math.round(box.x - initialBox.x),
            y: Math.round(box.y - initialBox.y),
            width: box.width,
            height: box.height,
          };
        })
        .toEqual({ x: 10, y: 50, width: 200, height: 40 });

      // there is no default proxy, and the item itself is hidden
      await expect(getDefaultProxy(page)).toHaveCount(0);
      await expect(a).toHaveCSS('visibility', 'hidden');

      // the list is the same one: its other items still make room
      expect(await getInlineTransform(getItem(page, 'rendered', 'b'))).toBe(
        'translate3d(0px, -40px, 0px)',
      );
    });

    await expect(proxy).toHaveCount(0);
    await expect(a).toHaveCSS('visibility', 'visible');

    await expect
      .poll(() => getOrder(page, 'rendered'))
      .toEqual(['b', 'a', 'c']);
    expect(await getLog(page)).toEqual([
      { name: 'rendered.onDrop', sortedIndexes: [1, 0, 2] },
    ]);

    // and again, with the list in its new order
    await dragBy(page, getItem(page, 'rendered', 'c'), { x: 0, y: -50 });

    await expect(proxy).toHaveCount(0);
    await expect
      .poll(() => getOrder(page, 'rendered'))
      .toEqual(['b', 'c', 'a']);
  });

  test('onDragProxySetup and onDragProxyMove change and move the default proxy', async ({
    page,
  }) => {
    const proxy = page.locator('body > [data-name="customized-proxy"]');
    const x = getItem(page, 'customized', 'x');
    const initialBox = (await x.boundingBox())!;

    await dragBy(page, x, { x: 10, y: 50 }, async () => {
      await expect(proxy).toHaveCount(1);
      await expect(proxy).toHaveText('x');
      await expect(proxy).toHaveAttribute('data-moved-by', '10,50');

      // moved by the page, not by the default transform
      expect(await getInlineTransform(proxy)).toBe('none');

      const box = (await proxy.boundingBox())!;
      expect(Math.round(box.x - initialBox.x)).toBe(10);
      expect(Math.round(box.y - initialBox.y)).toBe(50);

      await expect
        .poll(() => getLog(page))
        .toEqual([{ name: 'onDragProxySetup', dragItemId: 'x' }]);
    });

    await expect(proxy).toHaveCount(0);
    await expect(x).toHaveCSS('visibility', 'visible');

    await expect
      .poll(() => getOrder(page, 'customized'))
      .toEqual(['y', 'x', 'z']);

    // the setup is called once for a drag, and its cleanup once, on drop
    expect(await getLog(page)).toEqual([
      { name: 'onDragProxySetup', dragItemId: 'x' },
      { name: 'cleanup' },
      { name: 'customized.onDrop', sortedIndexes: [1, 0, 2] },
    ]);
  });

  test('with preserveDragSpace, the place of an item dragged out of the list stays empty', async ({
    page,
  }) => {
    await dragBy(
      page,
      getItem(page, 'customized', 'x'),
      { x: 0, y: 400 },
      async () => {
        for (const id of ['y', 'z']) {
          expect(
            await getInlineTransform(getItem(page, 'customized', id)),
          ).toBe('translate3d(0px, 0px, 0px)');
        }
      },
    );

    // the list has no onRemove, so nothing changes
    expect(await getOrder(page, 'customized')).toEqual(['x', 'y', 'z']);
    await expect
      .poll(async () => (await getLog(page)).map((call) => call.name))
      .toEqual(['onDragProxySetup', 'cleanup']);
  });

  test('without preserveDragSpace, the items after it take its place', async ({
    page,
  }) => {
    await dragBy(
      page,
      getItem(page, 'rendered', 'a'),
      { x: 0, y: 400 },
      async () => {
        for (const id of ['b', 'c']) {
          expect(await getInlineTransform(getItem(page, 'rendered', id))).toBe(
            'translate3d(0px, -40px, 0px)',
          );
        }
      },
    );

    expect(await getOrder(page, 'rendered')).toEqual(['a', 'b', 'c']);
  });
});

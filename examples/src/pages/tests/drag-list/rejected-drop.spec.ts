import { test, expect, Page } from '@testing';

import {
  dragBy,
  getInlineTransform,
  getItem,
  getList,
  getLog,
  getOrder,
} from './dragListUtils';

const getProviderState = async (page: Page) =>
  JSON.parse(await page.locator('[data-name="provider-state"]').innerText());

// the lists are 200px wide, with 50px between them
const TO_THE_TARGET = 250;

export default test.describe('DragList - a list that rejects a drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.load();
    await getList(page, 'source').waitFor();
  });

  test('an item rejected by shouldAcceptDrop is not accepted by the target', async ({
    page,
  }) => {
    await dragBy(
      page,
      getItem(page, 'source', 'locked'),
      { x: TO_THE_TARGET, y: 0 },
      async () => {
        await expect
          .poll(() => getProviderState(page))
          .toEqual({
            dragSourceListId: 'source',
            dropTargetListId: 'target',
            dragItemId: 'locked',
            status: 'rejected',
          });

        // the target does not make room for it
        expect(await getInlineTransform(getItem(page, 'target', 't2'))).toBe(
          '',
        );
      },
    );

    await expect
      .poll(() => getProviderState(page))
      .toEqual({
        dragSourceListId: null,
        dropTargetListId: null,
        dragItemId: '',
        status: 'accepted',
      });

    expect(await getOrder(page, 'target')).toEqual(['t1', 't2']);

    // the target is not called. The source is still told that the item was
    // dropped outside of it: it finds out about the rejection from the provider
    expect(await getLog(page)).toEqual([
      {
        name: 'source.onRemove',
        dragIndex: 1,
        dropIndex: -1,
        dragItemId: 'locked',
        status: 'rejected',
        dropTargetListId: 'target',
      },
    ]);
    expect(await getOrder(page, 'source')).toEqual(['free', 'locked', 'other']);
  });

  test('the status goes back to accepted when the rejected item leaves the target', async ({
    page,
  }) => {
    const locked = getItem(page, 'source', 'locked');
    const box = (await locked.boundingBox())!;
    const start = { x: box.x + 100, y: box.y + 20 };

    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + TO_THE_TARGET, start.y, { steps: 5 });

    await expect
      .poll(async () => (await getProviderState(page)).status)
      .toBe('rejected');

    // back over its own list
    await page.mouse.move(start.x, start.y + 10, { steps: 5 });

    await expect
      .poll(() => getProviderState(page))
      .toEqual({
        dragSourceListId: 'source',
        dropTargetListId: 'source',
        dragItemId: 'locked',
        status: 'accepted',
      });

    await page.mouse.up();

    expect(await getOrder(page, 'source')).toEqual(['free', 'locked', 'other']);
    expect(await getOrder(page, 'target')).toEqual(['t1', 't2']);
    expect((await getLog(page)).map((call) => call.name)).toEqual([
      'source.onDrop',
    ]);
  });

  test('an item that is not rejected is accepted by the same target', async ({
    page,
  }) => {
    await dragBy(
      page,
      getItem(page, 'source', 'free'),
      { x: TO_THE_TARGET, y: 0 },
      async () => {
        await expect
          .poll(() => getProviderState(page))
          .toEqual({
            dragSourceListId: 'source',
            dropTargetListId: 'target',
            dragItemId: 'free',
            status: 'accepted',
          });
      },
    );

    await expect
      .poll(() => getOrder(page, 'target'))
      .toEqual(['free', 't1', 't2']);
    expect(await getOrder(page, 'source')).toEqual(['locked', 'other']);

    expect(await getLog(page)).toEqual([
      {
        name: 'target.onAcceptDrop',
        dragItemId: 'free',
        dragSourceListId: 'source',
        dropTargetListId: 'target',
        dragIndex: 0,
        dropIndex: 0,
        dropItemId: 't1',
      },
      {
        name: 'source.onRemove',
        dragIndex: 0,
        dropIndex: -1,
        dragItemId: 'free',
        status: 'accepted',
        dropTargetListId: 'target',
      },
    ]);
  });

  test('a list that does not list the source in acceptDropsFrom ignores the drag', async ({
    page,
  }) => {
    // the source list has no acceptDropsFrom, so it takes nothing from the target
    await dragBy(
      page,
      getItem(page, 'target', 't1'),
      { x: -TO_THE_TARGET, y: 0 },
      async () => {
        await expect
          .poll(() => getProviderState(page))
          .toMatchObject({
            dragSourceListId: 'target',
            dragItemId: 't1',
          });
        expect(await getInlineTransform(getItem(page, 'source', 'free'))).toBe(
          '',
        );
      },
    );

    expect(await getOrder(page, 'source')).toEqual(['free', 'locked', 'other']);
    expect(await getOrder(page, 'target')).toEqual(['t1', 't2']);
    expect(await getLog(page)).toEqual([]);
  });
});

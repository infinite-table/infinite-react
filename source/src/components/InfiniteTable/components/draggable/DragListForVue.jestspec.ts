/**
 * @jest-environment jsdom
 *
 * The Vue DragList and DragDropProvider: what a drag makes Vue do.
 *
 * What a drag does to the page is covered by the Playwright specs in
 * examples/src/pages/tests/drag-list, which run against both React and Vue.
 * This spec covers what they can't see: how often the slots are rendered
 * and the provider state is written during a drag, and what is left behind
 * when a list is unmounted.
 */
import { createApp, defineComponent, h, nextTick, watch } from 'vue';
import type { App } from 'vue';

import { DragDropProvider, useDragDropProvider } from './DragDropProvider.vue';
import { DragList, useDragListContext } from './DragList.vue';
import { DragManager } from './DragManager';

// jsdom has no layout: every element says where it is in `data-rect`
// ("left,top,width,height")
Element.prototype.getBoundingClientRect = function () {
  const [left, top, width, height] = (
    this.getAttribute('data-rect') ?? '0,0,0,0'
  )
    .split(',')
    .map(Number);

  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON() {},
  } as DOMRect;
};

const ITEM_HEIGHT = 40;

const pointer = (
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  point: { x: number; y: number },
) =>
  new MouseEvent(type, { bubbles: true, clientX: point.x, clientY: point.y });

describe('Vue DragList', () => {
  let container: HTMLElement;
  let app: App | null = null;

  // how many times each slot was rendered
  let renders: { provider: number; lists: number; items: number };
  // every value the provider state had
  let providerStates: string[];

  const mount = async () => {
    renders = { provider: 0, lists: 0, items: 0 };
    providerStates = [];

    container = document.createElement('div');
    document.body.appendChild(container);

    const renderList = (
      dragListId: string,
      left: number,
      items: string[],
      acceptDropsFrom?: string[],
    ) =>
      h(
        DragList,
        { dragListId, orientation: 'vertical', acceptDropsFrom, onDrop() {} },
        {
          // the slot only uses domProps, as most lists do
          default: ({ domProps }: { domProps: Record<string, any> }) => {
            renders.lists++;

            return h(
              'div',
              { ...domProps, 'data-rect': `${left},0,100,120` },
              items.map((id, index) =>
                h(
                  DragList.DraggableItem,
                  { key: id, id },
                  {
                    default: ({
                      domProps,
                    }: {
                      domProps: Record<string, any>;
                    }) => {
                      renders.items++;

                      return h(
                        'div',
                        {
                          ...domProps,
                          'data-rect': `${left},${
                            index * ITEM_HEIGHT
                          },100,${ITEM_HEIGHT}`,
                        },
                        id,
                      );
                    },
                  },
                ),
              ),
            );
          },
        },
      );

    const Lists = defineComponent({
      setup() {
        const dragDropProvider = useDragDropProvider();

        watch(
          dragDropProvider,
          ({ dragSourceListId, dropTargetListId, dragItemId, status }) => {
            providerStates.push(
              `${dragSourceListId}>${dropTargetListId}:${dragItemId}:${status}`,
            );
          },
          { flush: 'sync' },
        );

        return () => [
          renderList('first', 0, ['a', 'b', 'c']),
          renderList('second', 200, ['x', 'y'], ['first']),
        ];
      },
    });

    app = createApp({
      render: () =>
        h(DragDropProvider, null, {
          // the slot does not use the context it is given
          default: () => {
            renders.provider++;

            return h(Lists);
          },
        }),
    });
    app.mount(container);

    await nextTick();
  };

  const getItem = (id: string) =>
    container.querySelector(`[data-drag-item-id="${id}"]`) as HTMLElement;
  const getList = (id: string) =>
    container.querySelector(`[data-drag-list-id="${id}"]`) as HTMLElement;

  afterEach(() => {
    // ends a drag a test may have left in progress
    window.dispatchEvent(pointer('pointerup', { x: 0, y: 0 }));

    app?.unmount();
    app = null;
    container.remove();
  });

  test('renders the same DOM contract as the React DragList', async () => {
    await mount();

    const list = getList('first');
    const item = getItem('b');

    expect(list.classList.contains('DragList')).toBe(true);
    expect(list.classList.contains('DragList--dragging')).toBe(false);

    expect(item.classList.contains('DraggableItem')).toBe(true);
    expect(item.getAttribute('data-drag-item-id')).toBe('b');
    expect(item.getAttribute('data-drag-item-list-id')).toBe('first');
  });

  test('the slots are rendered again when a drag starts and when it ends, and not while it moves', async () => {
    await mount();

    expect(renders).toEqual({ provider: 1, lists: 2, items: 5 });

    // pointer down is not a drag yet
    getItem('a').dispatchEvent(pointer('pointerdown', { x: 50, y: 20 }));
    await nextTick();

    expect(renders).toEqual({ provider: 1, lists: 2, items: 5 });
    expect(providerStates).toEqual([]);

    // the first move starts the drag: every list and item shows it
    window.dispatchEvent(pointer('pointermove', { x: 50, y: 25 }));
    await nextTick();

    expect(getList('first').classList.contains('DragList--dragging')).toBe(
      true,
    );
    expect(getItem('a').classList.contains('DraggableItem--active')).toBe(true);
    expect(getItem('b').classList.contains('DraggableItem--active')).toBe(
      false,
    );
    expect(renders).toEqual({ provider: 1, lists: 4, items: 10 });
    expect(providerStates).toEqual(['first>first:a:accepted']);

    // moving inside the list renders nothing and writes no state
    for (let y = 26; y <= 100; y += 2) {
      window.dispatchEvent(pointer('pointermove', { x: 50, y }));
    }
    await nextTick();

    expect(renders).toEqual({ provider: 1, lists: 4, items: 10 });
    expect(providerStates).toEqual(['first>first:a:accepted']);

    // over the other list: the state changes once, and the slots, which
    // don't use the drop target, are not rendered again
    for (let x = 220; x <= 260; x += 2) {
      window.dispatchEvent(pointer('pointermove', { x, y: 20 }));
    }
    await nextTick();

    expect(providerStates).toEqual([
      'first>first:a:accepted',
      'first>second:a:accepted',
    ]);
    expect(renders).toEqual({ provider: 1, lists: 4, items: 10 });

    // the drop
    window.dispatchEvent(pointer('pointerup', { x: 260, y: 20 }));
    await nextTick();

    expect(getList('first').classList.contains('DragList--dragging')).toBe(
      false,
    );
    expect(getItem('a').classList.contains('DraggableItem--active')).toBe(
      false,
    );
    expect(providerStates).toEqual([
      'first>first:a:accepted',
      'first>second:a:accepted',
      'null>null::accepted',
    ]);
    expect(renders).toEqual({ provider: 1, lists: 6, items: 15 });
  });

  test('an unmounted list leaves no interaction target and no listener behind', async () => {
    // the listeners the DragManager has, for all its events
    const countManagerListeners = () =>
      Object.values(
        (DragManager as any).emitter.listeners as Record<string, unknown[]>,
      ).reduce((count, handlers) => count + handlers.length, 0);

    const listenersBefore = countManagerListeners();

    await mount();

    // the provider listens to 3 events, each list to one
    expect(countManagerListeners()).toBe(listenersBefore + 5);

    getItem('a').dispatchEvent(pointer('pointerdown', { x: 50, y: 20 }));

    // the source list, and the list that accepts drops from it
    expect([...DragManager.dragInteractionTargetsMap.keys()].sort()).toEqual([
      'first',
      'second',
    ]);

    app!.unmount();
    app = null;

    expect(DragManager.dragInteractionTargetsMap.size).toBe(0);
    expect(countManagerListeners()).toBe(listenersBefore);
  });

  test('the composables have a default outside a provider and a list', async () => {
    let provider: ReturnType<typeof useDragDropProvider> | null = null;
    let list: ReturnType<typeof useDragListContext> | null = null;

    container = document.createElement('div');
    document.body.appendChild(container);

    app = createApp({
      setup() {
        provider = useDragDropProvider();
        list = useDragListContext();

        return () => h('div');
      },
    });
    app.mount(container);

    expect(provider!.value).toMatchObject({
      dragSourceListId: null,
      dropTargetListId: null,
      dragItemId: '',
      status: 'accepted',
    });
    expect(provider!.value.getCurrentDragSourceAndTarget()).toEqual({
      dragSourceListId: null,
      dropTargetListId: null,
      dragItemId: '',
      status: 'accepted',
    });
    expect(list!.value).toMatchObject({
      dragItemId: null,
      dragListId: '',
      draggingInProgress: false,
    });
  });
});

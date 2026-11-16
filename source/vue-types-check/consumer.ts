/**
 * A consumer of the built @infinite-table/infinite-vue types, type-checked
 * by check-vue-dts.cjs against dist-vue/index.d.ts.
 *
 * It only compiles if the public types take Vue values: vnodes from render
 * functions, Vue components as overrides, Vue style objects and native DOM
 * events in callbacks.
 */
import { defineComponent, h, Teleport } from 'vue';
import {
  DRAG_ITEM_ATTRIBUTE,
  DragDropProvider,
  DragList,
  useDragDropProvider,
  useDragListContext,
} from '@infinite-table/infinite-vue';
import type {
  DragDropSourceAndTarget,
  DragListProps,
  DragProxyMoveParams,
  DragProxySetupParams,
  InfiniteTablePropColumns,
  InfiniteTableProps,
  MenuIconProps,
  MenuItemDefinition,
} from '@infinite-table/infinite-vue';

type Person = { id: number; name: string; age: number };

const Cmp = defineComponent({
  setup() {
    return () => h('div');
  },
});

export const columns: InfiniteTablePropColumns<Person> = {
  name: {
    field: 'name',
    header: 'Name',
    render: ({ value }) => h('b', String(value)),
    renderValue: ({ value }) => `${value}`,
    renderHeader: () => h('i', 'Name'),
    style: { color: 'red', paddingInlineStart: '4px' },
    components: {
      ColumnCell: Cmp,
      HeaderCell: Cmp,
      Editor: Cmp,
      FilterEditor: Cmp,
      MenuIcon: Cmp,
    },
  },
  age: {
    field: 'age',
    style: () => ({ fontWeight: 'bold' }),
  },
};

const menuItems: MenuItemDefinition[] = [
  { key: 'one', label: h('b', 'One') },
  '-',
  { key: 'two', label: 'Two' },
];

export const tableProps: InfiniteTableProps<Person> = {
  columns,
  domProps: {
    class: 'from-class',
    className: 'from-className',
    style: { height: '100px' },
    'data-testid': 'grid',
  },
  components: {
    LoadMask: Cmp,
    CheckBox: Cmp,
    MenuIcon: (props: MenuIconProps) => h('span', props.className),
  },
  rowStyle: { opacity: 0.5 },
  onKeyDown: (_context, event) => {
    const native: KeyboardEvent = event;
    void native.key;
  },
  onCellClick: (_context, event) => {
    const native: MouseEvent = event;
    void native.clientX;
  },
  getContextMenuItems: () => menuItems,
};

// drag and drop: the lists are written with render functions and slots.
// `h()` does not infer what a slot is called with, so the slot functions
// take their parameter types from the components
type DragListSlot = NonNullable<
  InstanceType<typeof DragList>['$slots']['default']
>;
type DraggableItemSlot = NonNullable<
  InstanceType<typeof DragList.DraggableItem>['$slots']['default']
>;

export const dragListProps: DragListProps = {
  dragListId: 'list',
  orientation: 'vertical',
  acceptDropsFrom: ['list', 'other'],
  preserveDragSpace: true,
  shouldAcceptDrop: (event) => event.dragItem.id !== 'locked',
  onDrop: (sortedIndexes, { dragItemId }) => {
    void sortedIndexes.map((index) => index + 1);
    void dragItemId.length;
  },
  onDragProxySetup: ({ proxyElement }: DragProxySetupParams) => {
    proxyElement.setAttribute('data-drag-proxy', '');
  },
  onDragProxyMove: ({ proxyElement, dx, dy }: DragProxyMoveParams) => {
    proxyElement.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  },
  renderDragProxy: ({ dragItemId, ref }) =>
    dragItemId ? h(Teleport, { to: 'body' }, h('div', { ref })) : null,
};

export const DragListConsumer = defineComponent({
  setup() {
    const dragDropProvider = useDragDropProvider();
    const dragListContext = useDragListContext();

    return () => {
      const current: DragDropSourceAndTarget =
        dragDropProvider.value.getCurrentDragSourceAndTarget();
      const { status } = dragDropProvider.value;
      const { draggingInProgress, onDragItemPointerDown } =
        dragListContext.value;

      void [current.dragItemId, status, draggingInProgress];

      return h(DragDropProvider, null, {
        default: () =>
          h(DragList, dragListProps, {
            default: (({ domProps, context }) =>
              h('div', { ...domProps, 'data-list': context.dragListId }, [
                h(
                  DragList.DraggableItem,
                  { id: 1 },
                  {
                    default: (({ domProps, context }) => {
                      // a drag handle takes the pointer down handler
                      const { onPointerdown, ...rest } = domProps;
                      const id: string = rest[DRAG_ITEM_ATTRIBUTE];

                      return h('div', { ...rest, 'data-id': id }, [
                        h('span', { onPointerdown }),
                        h('span', {
                          onPointerdown: onDragItemPointerDown,
                        }),
                        context.active ? 'active' : null,
                      ]);
                    }) as DraggableItemSlot,
                  },
                ),
              ])) as DragListSlot,
          }),
      });
    };
  },
});

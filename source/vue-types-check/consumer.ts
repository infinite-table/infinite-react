/**
 * A consumer of the built @infinite-table/infinite-vue types, type-checked
 * by check-vue-dts.cjs against dist-vue/index.d.ts.
 *
 * It only compiles if the public types take Vue values: vnodes from render
 * functions, Vue components as overrides, Vue style objects and native DOM
 * events in callbacks.
 */
import { defineComponent, h } from 'vue';
import type {
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

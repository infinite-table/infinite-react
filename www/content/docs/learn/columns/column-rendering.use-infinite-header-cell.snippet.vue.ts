// Code shown on the Vue version of the "Column Rendering" page: the sibling of
// column-rendering.use-infinite-header-cell.snippet.tsx, with the same `#region` name.
// Type-checked with vue-tsc against the current source.

type Employee = {
  id: number;
  firstName: string;
  lastName: string;
};

//#region use-infinite-header-cell
import { defineComponent, h } from 'vue';
import { useInfiniteHeaderCell } from '@infinite-table/infinite-vue';
import type { InfiniteTableColumn } from '@infinite-table/infinite-vue';

const CustomHeader = defineComponent({
  setup() {
    const headerCell = useInfiniteHeaderCell<Employee>();

    return () => h('b', headerCell.value.column.field);
  },
});

const nameColumn: InfiniteTableColumn<Employee> = {
  field: 'firstName',
  header: () => h(CustomHeader),
};
//#endregion

export { nameColumn };

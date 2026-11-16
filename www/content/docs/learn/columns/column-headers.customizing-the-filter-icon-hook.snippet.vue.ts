// Code shown on the Vue version of the "Column Headers" page: the sibling of
// column-headers.customizing-the-filter-icon-hook.snippet.tsx, with the same `#region` name.
// Type-checked with vue-tsc against the current source.
import type { InfiniteTableColumn } from '@infinite-table/infinite-vue';

type Person = {
  id: string;
  firstName: string;
};

//#region customizing-the-filter-icon-hook
import { defineComponent, h } from 'vue';
import { useInfiniteHeaderCell } from '@infinite-table/infinite-vue';

/// ...

const CustomFilterIcon = defineComponent({
  setup() {
    const headerCell = useInfiniteHeaderCell(); // #highlight

    return () => (headerCell.value.filtered ? '🔥' : '');
  },
});

function renderFilterIcon() {
  return h(CustomFilterIcon);
}
//#endregion

// the function above is what `column.renderFilterIcon` is set to
export const filterIconComposableColumn: InfiniteTableColumn<Person> = {
  field: 'firstName',
  renderFilterIcon,
};

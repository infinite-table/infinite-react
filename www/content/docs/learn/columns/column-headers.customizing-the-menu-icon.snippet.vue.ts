// Code shown on the Vue version of the "Column Headers" page: the sibling of
// column-headers.customizing-the-menu-icon.snippet.tsx, with the same `#region` name.
// Type-checked with vue-tsc against the current source.
import type { InfiniteTableColumn } from '@infinite-table/infinite-vue';

type Person = {
  id: string;
  firstName: string;
};

//#region customizing-the-menu-icon
import { defineComponent, h } from 'vue';
import { useInfiniteHeaderCell } from '@infinite-table/infinite-vue';

/// ...

const CustomMenuIcon = defineComponent({
  setup() {
    const headerCell = useInfiniteHeaderCell(); // #highlight

    return () => `🔧 ${headerCell.value.column.id}`;
  },
});

function renderMenuIcon() {
  return h(CustomMenuIcon);
}
//#endregion

// the function above is what `column.renderMenuIcon` is set to
export const menuIconComposableColumn: InfiniteTableColumn<Person> = {
  field: 'firstName',
  renderMenuIcon,
};

// Code shown on the Vue version of the "Column Headers" page: the sibling of
// column-headers.snippet.tsx, with the same `#region` names (the regions that
// are the same code for React and Vue are shown from the .tsx file).
// Type-checked with vue-tsc against the current source.
import type { InfiniteTableColumn } from '@infinite-table/infinite-vue';

type Person = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
};

//#region customizing-the-column-sort-icon-hook
import { defineComponent, h } from 'vue';
import { useInfiniteHeaderCell } from '@infinite-table/infinite-vue';

/// ...

const SortIcon = defineComponent({
  setup() {
    const headerCell = useInfiniteHeaderCell(); // #highlight

    return () => {
      const { columnSortInfo } = headerCell.value;
      if (!columnSortInfo) {
        return ' 🤷‍♂️';
      }
      return columnSortInfo.dir === 1 ? '▲' : '▼';
    };
  },
});

function renderSortIcon() {
  return h(SortIcon);
}
//#endregion

// the function above is what `column.renderSortIcon` is set to
export const sortIconComposableColumn: InfiniteTableColumn<Person> = {
  field: 'firstName',
  renderSortIcon,
};

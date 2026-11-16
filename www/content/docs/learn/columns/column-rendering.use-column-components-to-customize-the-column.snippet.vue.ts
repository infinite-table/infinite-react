// Code shown on the Vue version of the "Column Rendering" page: the sibling of
// column-rendering.use-column-components-to-customize-the-column.snippet.tsx,
// with the same `#region` name.
// Type-checked with vue-tsc against the current source.
import { defineComponent, h } from 'vue';
import { useInfiniteHeaderCell } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
};

//#region use-column-components-to-customize-the-column
import type { InfiniteTableColumn } from '@infinite-table/infinite-vue';

const ColumnCell = defineComponent({
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () =>
      h(
        'div',
        { ...attrs, style: [attrs.style, { color: 'red' }] },
        slots.default?.(),
      );
  },
});

const HeaderCell = defineComponent({
  inheritAttrs: false,
  setup(_props, { attrs }) {
    const headerCell = useInfiniteHeaderCell<Developer>();

    return () => {
      const { renderBag } = headerCell.value;

      return h('div', { ...attrs, style: [attrs.style, { color: 'red' }] }, [
        renderBag.sortIcon,
        'First name',
      ]);
    };
  },
});

const nameColumn: InfiniteTableColumn<Developer> = {
  header: 'Name',
  field: 'firstName',
  components: {
    ColumnCell,
    HeaderCell,
  },
};
//#endregion

export { nameColumn };

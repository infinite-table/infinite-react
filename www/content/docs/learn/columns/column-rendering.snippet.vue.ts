// Code shown on the Vue version of the "Column Rendering" page: the sibling of
// column-rendering.snippet.tsx, with the same `#region` names (the regions that
// are the same code for React and Vue are shown from the .tsx file).
// Type-checked with vue-tsc against the current source.

type Employee = {
  id: number;
  firstName: string;
  lastName: string;
};

// used as `T` in the snippets below
type T = {
  id: number;
  person: {
    salary: number;
  };
};

// this snippet shows its imports, which the other snippets in the file use as well
//#region use-infinite-column-cell
import { defineComponent, h } from 'vue';
import { useInfiniteColumnCell } from '@infinite-table/infinite-vue';
import type { InfiniteTableColumn } from '@infinite-table/infinite-vue';

const CustomName = defineComponent({
  setup() {
    const cell = useInfiniteColumnCell<Employee>();

    return () => {
      const { data } = cell.value;

      return [h('b', data?.firstName), ', ', data?.lastName];
    };
  },
});

const nameColumn: InfiniteTableColumn<Employee> = {
  header: 'Employee Name',
  renderValue: () => h(CustomName),
};
//#endregion

export function renderValueWithComponent() {
  //#region use-rendervalue-and-render-to-display-custom
  type Developer = { country: string; name: string; id: string };

  const CountryInfo = defineComponent({
    setup() {
      const cell = useInfiniteColumnCell<Developer>();

      return () => {
        const { value } = cell.value;

        return h('div', `Country: ${value}`);
      };
    },
  });

  const columns = {
    country: {
      field: 'country',
      renderValue: () => h(CountryInfo),
    },
  };
  //#endregion

  // the snippet has no type annotation, so check it against the column type here
  // (without `field`, which is just a `string` in an object that has no annotation)
  const checked: Record<string, Omit<InfiniteTableColumn<Developer>, 'field'>> = columns;
  return checked;
}

//#region use-column-components-to-customize-the-column
// a component specified in column.components.ColumnCell
const ColumnCell = defineComponent({
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => h('div', { ...attrs }, slots.default?.());
  },
});
//#endregion

export function renderBagValueInRender() {
  //#region rendering-pipeline-renderbag-value-in-render
  const column: InfiniteTableColumn<T> = {
    valueGetter: () => 'world',
    renderValue: ({ value }) => { // #highlight
      // at this stage, `value` is 'world' and `renderBag.value` has the same value, 'world'
      return h('b', value);
    },

    render: ({ renderBag }) => {
      // at this stage `value` is 'world'
      // but `renderBag.value` is <b>world</b>, as this was the value returned by `renderValue`
      return h('div', ['Hello ', renderBag.value, '!']);
    }, // #highlight
  };
  //#endregion
  return column;
}

export function renderBagGroupIcon() {
  //#region rendering-pipeline-renderbag-groupicon
  const column: InfiniteTableColumn<T> = {
    renderGroupIcon: ({ renderBag }) => { // #highlight
      return [' [ ', renderBag.groupIcon, ' ] '];
    },
    render: ({ renderBag }) => {
      return [
        // use the groupIcon from the renderBag
        renderBag.groupIcon, // #highlight
        renderBag.value,
      ];
    },
  };
  //#endregion
  return column;
}

export function renderBagSelectionCheckBox() {
  //#region rendering-pipeline-renderbag-selectioncheckbox
  const column: InfiniteTableColumn<T> = {
    renderSelectionCheckBox: (params) => { // #highlight
      if (!params.rowInfo) {
        // the function is also called for the column header
        return params.renderBag.selectionCheckBox;
      }
      const {
        rowSelected,
        isGroupRow,
        toggleCurrentRowSelection,
        toggleCurrentGroupRowSelection,
      } = params;
      const toggle = isGroupRow
        ? toggleCurrentGroupRowSelection
        : toggleCurrentRowSelection;

      // you could return renderBag.groupIcon to have the default icon

      const selection =
        rowSelected === null
          ? '-' // we're in a group row with indeterminate state if rowSelected === null
          : rowSelected
          ? 'x'
          : 'o';

      return h('div', { onClick: toggle }, ` [ ${selection} ] `);
    },
    render: ({ renderBag }) => {
      return [ // #highlight
        // use the selectionCheckBox from the renderBag
        renderBag.selectionCheckBox,
        renderBag.groupIcon,
        renderBag.value,
      ];
    },
  };
  //#endregion
  return column;
}

export { nameColumn, ColumnCell };

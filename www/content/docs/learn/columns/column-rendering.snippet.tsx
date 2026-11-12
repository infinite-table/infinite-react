// Snippets shown on column-rendering.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';

type Employee = {
  id: number;
  firstName: string;
  lastName: string;
};

// used as `DATA_TYPE` and `T` in the snippets below
type DATA_TYPE = Employee;
type T = {
  id: number;
  person: {
    salary: number;
  };
};

// this snippet shows its imports, which the other snippets in the file use as well
//#region use-infinite-column-cell
import {
  useInfiniteColumnCell,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';

function CustomName() {
  const { data, rowInfo } = useInfiniteColumnCell<Employee>();

  return (
    <>
      <b>{data?.firstName}</b>, {data?.lastName}
    </>
  );
}

const nameColumn: InfiniteTableColumn<Employee> = {
  header: 'Employee Name',
  renderValue: () => <CustomName />,
};
//#endregion

export function valueGetterColumn() {
  //#region change-the-value-using-valuegetter
  const nameColumn: InfiniteTableColumn<Employee> = {
    header: 'Employee Name',
    valueGetter: ({ data }) => `${data.firstName} ${data.lastName}`,
  };
  //#endregion
  return nameColumn;
}

export function renderValueWithComponent() {
  //#region use-rendervalue-and-render-to-display-custom
  type Developer = { country: string; name: string; id: string };

  const CountryInfo = () => {
    const { data, rowInfo, value } = useInfiniteColumnCell<Developer>();

    return <div>Country: {value}</div>;
  };

  const columns = {
    country: {
      field: 'country',
      renderValue: () => <CountryInfo />,
    },
  };
  //#endregion

  // the snippet has no type annotation, so check it against the column type here
  // (without `field`, which is just a `string` in an object that has no annotation)
  const checked: Record<string, Omit<InfiniteTableColumn<Developer>, 'field'>> = columns;
  return checked;
}

export function ColumnCell() {
  //#region use-column-components-to-customize-the-column
  // inside a component specified in column.components.ColumnCell
  const { domRef } = useInfiniteColumnCell<DATA_TYPE>();

  return <div ref={domRef}>...</div>;
  //#endregion
}

export function renderBagValue() {
  //#region rendering-pipeline-renderbag-value
  const column: InfiniteTableColumn<T> = {
    // the valueGetter can be useful when rows are nested objects
    // or you want to compose multiple values from the row
    valueGetter: ({ data }) => {
      return data.person.salary * 10;
    },
    valueFormatter: ({
      value,
      isGroupRow,
      data,
      field,
      rowInfo,
      rowSelected,
      rowActive,
    }) => {
      // the value here is what the `valueFormatter` returned
      return `USD ${value}`;
    },
  };
  //#endregion
  return column;
}

export function renderBagValueInRender() {
  //#region rendering-pipeline-renderbag-value-in-render
  const column: InfiniteTableColumn<T> = {
    valueGetter: () => 'world',
    renderValue: ({ value, renderBag, rowInfo }) => { // #highlight
      // at this stage, `value` is 'world' and `renderBag.value` has the same value, 'world'
      return <b>{value}</b>;
    },

    render: ({ value, renderBag, rowInfo }) => {
      // at this stage `value` is 'world'
      // but `renderBag.value` is <b>world</b>, as this was the value returned by `renderValue`
      return <div>Hello {renderBag.value}!</div>;
    }, // #highlight
  };
  //#endregion
  return column;
}

export function renderBagGroupIcon() {
  //#region rendering-pipeline-renderbag-groupicon
  const column: InfiniteTableColumn<T> = {
    renderGroupIcon: ({ renderBag, toggleGroupRow }) => { // #highlight
      return <> [ {renderBag.groupIcon} ] </>;
    },
    render: ({ renderBag }) => {
      return (
        <>
          {/* use the groupIcon from the renderBag */}
          {renderBag.groupIcon} {/* #highlight */}
          {renderBag.value}
        </>
      );
    },
  };
  //#endregion
  return column;
}

export function renderBagSelectionCheckBox() {
  //#region rendering-pipeline-renderbag-selectioncheckbox
  const column: InfiniteTableColumn<T> = {
    renderSelectionCheckBox: (params) => { // #highlight
      if (params.rowInfo === null) {
        // the function is also called for the column header
        return params.renderBag.selectionCheckBox;
      }
      const {
        renderBag,
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

      return <div onClick={toggle}> [ {selection} ] </div>;
    },
    render: ({ renderBag }) => {
      return ( // #highlight
        <>
          {/* use the selectionCheckBox from the renderBag */}
          {renderBag.selectionCheckBox}
          {renderBag.groupIcon}
          {renderBag.value}
        </>
      );
    },
  };
  //#endregion
  return column;
}

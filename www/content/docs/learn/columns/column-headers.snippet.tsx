// Snippets shown on column-headers.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  InfiniteTableColumn,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Person = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
};

export function columnHeaderLabel() {
  //#region column-header-label
  type Developer = {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
  };
  const columns: InfiniteTablePropColumns<Developer> = {
    id: {
      field: 'id', // will be used as default label in column header
      defaultWidth: 100,
    },
    name: {
      header: 'First and Last Name', // custom column header label
      valueGetter: ({ data }) => `${data.firstName} ${data.lastName}`,
    },
  };
  //#endregion
  return columns;
}

export const sortIconColumn: InfiniteTableColumn<Person> = {
  field: 'firstName',
  //#region customizing-the-column-sort-icon
  renderSortIcon({ columnSortInfo }) { // #highlight
    if (!columnSortInfo) {
      return ' 🤷‍♂️';
    }
    return columnSortInfo.dir === 1 ? '▲' : '▼';
  }
  //#endregion
};

//#region customizing-the-column-sort-icon-hook
import {
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-react';

/// ...

function renderSortIcon(){
  const { columnSortInfo } = useInfiniteHeaderCell(); // #highlight
  if (!columnSortInfo) {
    return ' 🤷‍♂️';
  }
  return columnSortInfo.dir === 1 ? '▲' : '▼';
}
//#endregion

// the function above is what `column.renderSortIcon` is set to
export const sortIconHookColumn: InfiniteTableColumn<Person> = {
  field: 'firstName',
  renderSortIcon,
};

export const menuIconColumn: InfiniteTableColumn<Person> = {
  field: 'firstName',
  //#region customizing-the-menu-icon
  renderMenuIcon({ column }) { // #highlight
    return `🔧 ${column.id}`;
  }
  //#endregion
};

export const filterIconColumn: InfiniteTableColumn<Person> = {
  field: 'firstName',
  //#region customizing-the-filter-icon
  renderFilterIcon({ filtered }) { // #highlight
    return filtered ? '🔍' : '';
  }
  //#endregion
};

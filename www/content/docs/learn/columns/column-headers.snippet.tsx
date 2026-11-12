// Snippets shown on column-headers.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

{
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
}

{
  //#region customizing-the-column-sort-icon
  renderSortIcon({ columnSortInfo }) { // #highlight
    if (!columnSortInfo) {
      return ' 🤷‍♂️';
    }
    return columnSortInfo.dir === 1 ? '▲' : '▼';
  }
  //#endregion
}

//#region customizing-the-column-sort-icon-2
import {
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-react';

/// ...

renderSortIcon(){
  const { columnSortInfo } = useInfiniteHeaderCell(); // #highlight
  if (!columnSortInfo) {
    return ' 🤷‍♂️';
  }
  return columnSortInfo.dir === 1 ? '▲' : '▼';
},
//#endregion

{
  //#region customizing-the-menu-icon
  renderMenuIcon({ column }) { // #highlight
    return `🔧 ${column.id}`;
  }
  //#endregion
}

{
  //#region customizing-the-filter-icon
  renderFilterIcon({ filtered }) { // #highlight
    return filtered ? '🔍' : '';
  }
  //#endregion
}

export {};

// Snippet shown on column-rendering.page.md (in its own file, as it has imports).
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';

type Employee = {
  id: number;
  firstName: string;
  lastName: string;
};

//#region use-infinite-header-cell
import {
  useInfiniteHeaderCell,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';

function CustomHeader() {
  const { column } = useInfiniteHeaderCell<Employee>();

  return <b>{column.field}</b>;
}

const nameColumn: InfiniteTableColumn<Employee> = {
  field: 'firstName',
  header: () => <CustomHeader />,
};
//#endregion

export { nameColumn };

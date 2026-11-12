// Snippets shown on column-rendering.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

//#region hook
import {
  useInfiniteHeaderCell,
  InfiniteTableColumn,
} from '@infinite-table/infintie-react';

function CustomHeader() {
  const { column } = useInfiniteHeaderCell<Employee>();

  return <b>{column.field}</b>;
}

const nameColumn: InfiniteTableColumn<Employee> = {
  header: 'Employee Name',
  field: 'firstName',
  header: () => <CustomHeader />,
};
//#endregion

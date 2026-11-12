// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
} from '@infinite-table/infinite-react';

//#region intro
export type Employee = {
  id: number;
  companyName: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  department: string;
  team: string;
  salary: number;

};

// InfiniteTableColumn is a generic type, you have to bind it to a specific data-type
import { InfiniteTableColumn } from '@infinite-table/infinite-react';

// we're binding it here to the `Employee` type
// which means the `column.field` has to be `keyof Employee`
export const columns: Record<string, InfiniteTableColumn<Employee>> = {
  'firstName':
  {
    field: 'firstName',
    header: 'First Name',
  },
  'country':
  {
    field: 'country',
  },
  'city':
  {
    field: 'city'
  },
  'salary':
  {
    field: 'salary',
    type: 'number'
  },
}
<InfiniteTable columns={columns} />
//#endregion

{
  //#region column-order

  const columnOrder = ['firstName','id','curency']

  const App = () => {
    return <DataSource<DATA_TYPE> primaryKey={"id"} dataSource={...}>
      <InfiniteTable<DATA_TYPE>
        columnOrder={columnOrder}
        onColumnOrderChange={(columnOrder: string[]) => {}}
      />
    </DataSource>
  }
  //#endregion
}

export {};

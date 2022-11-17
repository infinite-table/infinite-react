import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { data, Person } from './data';

const focusedWithinStyle = {
  outline: '3px solid tomato',
};
export default function App() {
  const onBlurWithin = React.useCallback(() => {
    console.log('onBlurWithin');
  }, []);

  return (
    <DataSource<Person> data={data} primaryKey="Id">
      <InfiniteTable<Person>
        onBlurWithin={onBlurWithin}
        focusedWithinStyle={focusedWithinStyle}
        columns={columns}
      />
    </DataSource>
  );
}

const columns: Map<string, InfiniteTableColumn<Person>> = new Map([
  [
    'id',
    {
      field: 'Id',
      type: 'number',
      sortable: true,
      width: 80,
    },
  ],
  [
    'firstName',
    {
      field: 'FirstName',
      render: ({ value }: { value: any }) => (
        <input type="text" value={value} />
      ),
    },
  ],
  ['age', { field: 'Age', type: 'number' }],
]);

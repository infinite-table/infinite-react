import * as React from 'react';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import type { InfiniteTableColumn } from '@infinite-table/infinite-react';

type Person = {
  Id: number;
  FirstName: string;
  Age: number;
};

const data: Person[] = [...new Array(100_000)].map((_x, i) => {
  return {
    Id: i,
    Age: i,
    FirstName: `${i}`,
  };
});
console.log(data);

const domProps = {
  style: { height: '80vh' },
};

export default function App() {
  const columns: Record<
    string,
    InfiniteTableColumn<Person>
  > = React.useMemo(() => {
    return {
      id: {
        // specifies which field from the data source
        // should be rendered in this column
        field: 'Id',
        type: 'number',
        sortable: true,
        width: 80,
      },

      firstName: {
        field: 'FirstName',
      },
      age: { field: 'Age', type: 'number' },
    };
  }, []);

  return (
    <DataSource<Person>
      data={data}
      primaryKey="Id"
      lazyLoad={{ batchSize: 50 }}
    >
      <InfiniteTable<Person>
        columnDefaultWidth={130}
        domProps={domProps}
        columns={columns}
      />
    </DataSource>
  );
}

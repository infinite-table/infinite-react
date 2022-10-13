import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import type { InfiniteTableColumn } from '@infinite-table/infinite-react';
import * as React from 'react';

type Person = {
  Id: number;
  FirstName: string;
  Age: number;
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

  const data: Person[] = React.useMemo(
    () => [
      {
        Id: 1,
        FirstName: 'Bob',
        Age: 3,
      },
      {
        Id: 2,
        FirstName: 'Alice',
        Age: 50,
      },
      {
        Id: 3,
        FirstName: 'Bill',
        Age: 5,
      },
    ],
    [],
  );

  return (
    <DataSource<Person> data={data} primaryKey="Id">
      <InfiniteTable<Person> columnDefaultWidth={130} columns={columns} />
    </DataSource>
  );
}

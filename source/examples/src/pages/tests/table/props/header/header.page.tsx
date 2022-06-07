import * as React from 'react';

import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';

interface Person {
  Id: number;
  FirstName: string;
  LastName: string;
  Address: string;
  Age: number;
}

const data = [
  {
    Id: 20,
    FirstName: 'Bob',
    LastName: 'Bobson',
    Address: 'United States, Nashvile 8, rue due Secour',
    Age: 3,
  },
  {
    Id: 3,
    FirstName: 'Alice',
    LastName: 'Aliceson',
    Address: 'United States, San Francisco 5',
    Age: 50,
  },
  {
    Id: 10,
    FirstName: 'Bill',
    LastName: 'Billson',
    Address: 'France, Paris, Sur seine',
    Age: 5,
  },
];

const columns = new Map<string, InfiniteTableColumn<Person>>([
  [
    'Id',
    {
      field: 'Id',
      type: 'number',
    },
  ],
  [
    'FirstName',
    {
      field: 'FirstName',
      header: 'First Name',
    },
  ],
  [
    'LastName',
    {
      field: 'LastName',
      header: 'Last Name',
    },
  ],
  [
    'Age',
    {
      field: 'Age',
      type: 'number',
    },
  ],
]);
export default () => {
  const [header, setHeader] = React.useState(true);
  const toggle = () => setHeader((header) => !header);

  return (
    <React.StrictMode>
      <button onClick={toggle}>toggle</button>
      <DataSource<Person>
        data={data}
        primaryKey="Id"
        fields={['Id', 'FirstName', 'Age', 'Address', 'LastName']}
      >
        <InfiniteTable<Person>
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              border: '1px solid gray',
              position: 'relative',
            } as React.CSSProperties,
          }}
          columnDefaultWidth={200}
          columns={columns}
          rowHeight={30}
          header={header}
        />
      </DataSource>
    </React.StrictMode>
  );
};

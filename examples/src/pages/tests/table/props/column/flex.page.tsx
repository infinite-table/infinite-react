import * as React from 'react';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';

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
export default () => {
  const [columnDefaultWidth, setColumnDefaultWidth] = React.useState(150);
  const [addressFlex, setAddressFlex] = React.useState(2);
  const [minWidth, setMinWidth] = React.useState(100);
  return (
    <React.StrictMode>
      <div>
        <p>
          Column default width:{' '}
          <input
            type="number"
            name="default-width"
            value={columnDefaultWidth}
            onChange={(e) =>
              setColumnDefaultWidth((e.target.value as any as number) * 1)
            }
          />
        </p>
        <p>
          Column min width:{' '}
          <input
            type="number"
            name="min-width"
            value={minWidth}
            onChange={(e) => setMinWidth((e.target.value as any as number) * 1)}
          />
        </p>
        <p>
          Address flex:{' '}
          <input
            type="number"
            name="address-flex"
            value={addressFlex}
            onChange={(e) =>
              setAddressFlex((e.target.value as any as number) * 1)
            }
          />
        </p>
      </div>
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
            },
          }}
          columnDefaultWidth={columnDefaultWidth}
          columnMinWidth={minWidth}
          sortable={false}
          onColumnSizingChange={(columnSizing) => {
            console.log(columnSizing);
          }}
          columns={{
            Id: {
              field: 'Id',
              type: 'number',
              defaultSortable: true,
            },
            firstName: {
              field: 'FirstName',
              header: 'First name - flex 1',
              defaultFlex: 1,
            },
            lastName: {
              field: 'LastName',
              header: 'flex 1 - maxWidth 200',
              maxWidth: 200,
              defaultFlex: 1,
            },
            address: {
              field: 'Address',
              header: `Address - flex ${addressFlex}`,
              defaultFlex: addressFlex,
            },
            age: { field: 'Age', type: 'number' },
          }}
        />
      </DataSource>
    </React.StrictMode>
  );
};

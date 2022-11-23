import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
  InfiniteTablePropGetColumnContextMenuItems,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';
import { useState } from 'react';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
};

const data: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Bob',
    age: 20,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 2,
    firstName: 'Marry',
    lastName: 'Bob',
    age: 25,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 3,
    firstName: 'Bill',
    lastName: 'Bobson',
    age: 30,
    canDesign: 'no',
    currency: 'CAD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
  },
  {
    id: 4,
    firstName: 'Mark',
    lastName: 'Twain',
    age: 31,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    age: 29,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
  },
  age: {
    field: 'age',
    type: 'number',
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

export default () => {
  const getColumContextMenuItems: InfiniteTablePropGetColumnContextMenuItems<
    Developer
  > = (items, { column }) => {
    if (column.id === 'currency') {
      return [];
    }
    items.push({
      key: 'hi',
      label: 'Hello',
      onClick: () => {
        setMsg('hello ' + column.id);
      },
    });

    if (column.id === 'age') {
      items.push({
        key: 'ageitem',
        label: 'Age',
        onClick: () => {
          setMsg('age!');
        },
      });
    }
    return items;
  };

  const [msg, setMsg] = useState('');
  return (
    <>
      <React.StrictMode>
        <div data-name="msg" style={{ color: 'magenta' }}>
          {msg}
        </div>
        <DataSource<Developer> data={data} primaryKey="id">
          <InfiniteTable<Developer>
            domProps={{
              style: {
                margin: '5px',
                height: 500,
                width: 1000,
                border: '1px solid gray',
                position: 'relative',
              },
            }}
            getColumContextMenuItems={getColumContextMenuItems}
            columnDefaultWidth={100}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};

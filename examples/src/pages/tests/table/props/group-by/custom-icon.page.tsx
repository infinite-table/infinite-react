import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
  components,
} from '@infinite-table/infinite-react';

import * as React from 'react';

import { data, Person } from './people';

const { MenuIcon } = components;

const columns: Record<string, InfiniteTableColumn<Person>> = {
  name: {
    field: 'name',
    header: 'NAME - TEST USES THIS COLUMN',
    renderMenuIcon: ({ renderBag }) => {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            color: 'red',
          }}
          data-name="test-icon"
        >
          x{renderBag.menuIcon}
        </div>
      );
    },
  },
  department: {
    field: 'department',
    style: {
      color: 'red',
    },
    renderMenuIcon: ({ renderBag }) => {
      return renderBag.menuIcon;
    },
  },

  team: {
    field: 'team',
    renderMenuIcon: ({ renderBag }) => {
      return <MenuIcon {...renderBag.menuIconProps} />;
    },
  },
};

export default function App() {
  const groupBy: DataSourceGroupBy<Person>[] = [
    {
      field: 'department',
    },
    { field: 'team', column: { field: 'team' } },
  ];

  return (
    <React.StrictMode>
      <DataSource<Person>
        data={data.slice(0, 5)}
        primaryKey="id"
        groupBy={groupBy}
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
          columnDefaultWidth={250}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}

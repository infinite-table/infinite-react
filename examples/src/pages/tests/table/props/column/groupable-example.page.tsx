import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  DataSourceData,
} from '@infinite-table/infinite-react';
import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;

  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: {
    field: 'preferredLanguage',
    header: 'Language',
  },
  salary: {
    field: 'salary',
    type: 'number',
    defaultGroupable: false,
  },
  age: {
    field: 'age',
  },
  canDesign: {
    field: 'canDesign',
    defaultGroupable: true,
    header: ({ renderLocation }) => {
      return (
        <div>
          hey{' '}
          {renderLocation === 'grouping-toolbar'
            ? 'CAN DESIGN'
            : 'can design!!'}
        </div>
      );
    },
  },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id', defaultGroupable: false },
};

const dataSource: DataSourceData<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

export default function App() {
  return (
    <DataSource<Developer>
      data={dataSource}
      primaryKey="id"
      defaultGroupBy={[
        { field: 'country' },
        {
          field: 'stack',
        },
      ]}
    >
      <InfiniteTable<Developer>
        domProps={{
          style: {
            marginBlock: '80px',
            marginInline: '80px',
            height: '80vh',
            border: '1px solid gray',
            position: 'relative',
          },
        }}
        columns={columns}
        columnDefaultWidth={200}
        columnDefaultGroupable
        groupRenderStrategy="single-column"
      >
        <div className="flex flex-1 flex-row">
          <div className="flex-1 flex flex-col">
            <InfiniteTable.Header allowColumnHideWhileDragging={false} />
            <InfiniteTable.Body />
          </div>
          <InfiniteTable.GroupingToolbar
            orientation="vertical"
            components={{
              Host: (props) => {
                return (
                  <div
                    {...props.domProps}
                    style={{
                      backgroundColor:
                        props.active && !props.rejectDrop
                          ? 'blue'
                          : props.active && props.rejectDrop
                          ? 'red'
                          : 'transparent',
                    }}
                  >
                    Group{props.domProps?.children}
                  </div>
                );
              },
            }}
          />
        </div>
      </InfiniteTable>

      <InfiniteTable<Developer>
        domProps={{
          style: {
            marginBlock: '80px',
            marginInline: '80px',
            height: '80vh',
            border: '1px solid gray',
            position: 'relative',
          },
        }}
        columns={columns}
        columnDefaultWidth={200}
        columnDefaultGroupable
        groupRenderStrategy="single-column"
      >
        <InfiniteTable.GroupingToolbar orientation="horizontal" />
        <InfiniteTable.Header allowColumnHideWhileDragging={false} />
        <InfiniteTable.Body />
      </InfiniteTable>
    </DataSource>
  );
}

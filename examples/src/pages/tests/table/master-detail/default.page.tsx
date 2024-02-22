import * as React from 'react';
import styles from './default.module.css';

import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  InfiniteTableRowInfo,
  DataSourceProps,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
  streetName: string;
  streetNo: number;
  streetPrefix: string;
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',

    // render: ({ value, toggleCurrentRowDetails }) => {
    //   return (
    //     <div>
    //       {value}{' '}
    //       <button onClick={() => toggleCurrentRowDetails()}>toggle</button>
    //     </div>
    //   );
    // },
  },

  firstName: { field: 'firstName' },
  age: {
    field: 'age',
    type: ['number'],
  },
  salary: {
    field: 'salary',
    type: ['number', 'currency'],
    style: {
      color: 'red',
    },
    renderRowDetailsIcon: true,
  },

  canDesign: { field: 'canDesign' },
  preferredLanguage: { field: 'preferredLanguage' },
  city: { field: 'city' },
  lastName: { field: 'lastName' },
  hobby: { field: 'hobby' },
  stack: { field: 'stack' },
  streetName: { field: 'streetName' },
  currency: { field: 'currency' },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const detailDataSource: DataSourceProps<Developer>['data'] = ({
  sortInfo,
  filterValue,
  masterRowInfo,
}) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }
  console.log(masterRowInfo?.data, 'master');

  const args = [
    filterValue
      ? 'filterBy=' +
        JSON.stringify(
          filterValue.map(({ field, filter }) => {
            return {
              field: field,
              value: filter.value,
              operator: filter.operator,
            };
          }),
        )
      : null,
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s: any) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');

  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers10-sql?' + args)
    .then((r) => r.json())
    .then((response: { data: Developer[] }) => {
      const { data } = response;

      return new Promise<Developer[]>((resolve) => {
        setTimeout(() => {
          resolve(
            data.map((x) => {
              return {
                ...x,
                id: `000${x.id}` as any as number,
              } as Developer;
            }),
          );
        }, 1000);
      });
    });
};

const detailCols: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName' },
  age: { field: 'age' },
  salary: { field: 'salary' },
  canDesign: { field: 'canDesign' },
  preferredLanguage: { field: 'preferredLanguage' },
  city: { field: 'city' },
  lastName: { field: 'lastName' },
  hobby: { field: 'hobby' },
  stack: { field: 'stack' },
  streetName: { field: 'streetName' },
  currency: { field: 'currency' },
};

const detailsDOMProps = {
  style: {
    flex: 1,
  },
};
export default function DataTestPage() {
  return (
    <React.StrictMode>
      <DataSource<Developer> data={dataSource} primaryKey="id">
        <InfiniteTable<Developer>
          debugId="root-infinite"
          columnDefaultWidth={130}
          rowHeight={50}
          defaultRowDetailState={{
            expandedRows: [1, 2],
            collapsedRows: true,
          }}
          rowDetailCache={false}
          rowDetailRenderer={(
            rowInfo: InfiniteTableRowInfo<Developer>,
            _cache,
          ) => {
            return (
              <div
                style={{
                  background: 'tomato',
                  padding: 20,
                  height: '100%',
                  display: 'flex',
                  flexFlow: 'column',
                }}
              >
                <form style={{ padding: 20 }}>
                  <label>
                    First name:
                    <input
                      name="first name"
                      defaultValue={rowInfo.data?.firstName}
                    />
                  </label>
                  <label>
                    Age:
                    <input
                      name="last name"
                      type="number"
                      defaultValue={rowInfo.data?.age}
                    />
                  </label>
                </form>
                <DataSource<Developer>
                  debugId={`datasource-detail-${rowInfo.id}`}
                  data={detailDataSource}
                  sortMode="remote"
                  filterMode="remote"
                  primaryKey="id"
                  defaultGroupBy={[
                    {
                      field: 'stack',
                    },
                  ]}
                  defaultFilterValue={[]}
                  key={rowInfo.id}
                >
                  <InfiniteTable<Developer>
                    debugId={`infinite-detail-${rowInfo.id}`}
                    domProps={detailsDOMProps}
                    columns={detailCols}
                  />
                </DataSource>
              </div>
            );
          }}
          domProps={{
            className: styles.CustomRowHeight,
            style: {
              margin: '5px',
              height: '80vh',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}

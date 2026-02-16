import * as React from 'react';
import styles from './default.module.css';

import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  DataSourceProps,
  useMasterRowInfo,
  useDataSourceState,
  DataSourceState,
  useInfiniteHeaderCell,
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

function HeaderWithCount() {
  const dataArray = useDataSourceState(
    (state: DataSourceState<Developer>) => state.dataArray,
  );

  const { column } = useInfiniteHeaderCell<Developer>();
  const length = dataArray.length;
  return (
    <div>
      {column.id} {length}
    </div>
  );
}
const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    renderHeader: () => {
      return <HeaderWithCount />;
    },
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
    renderRowDetailIcon: true,
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
        // setTimeout(() => {
        resolve(
          data.map((x) => {
            return {
              ...x,
              id: `000${x.id}` as any as number,
            } as Developer;
          }),
        );
        // }, 1000);
      });
    });
};

const detailCols: InfiniteTablePropColumns<Developer> = {
  firstNameChildColumn: {
    field: 'firstName',

    renderHeader: () => {
      return <HeaderWithCount />;
    },
  },
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

function RowDetail() {
  const rowInfo = useMasterRowInfo<Developer>();

  if (!rowInfo) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2 p-[20px] bg-[tomato] h-full">
      <form className="flex flex-row gap-2 items-center">
        <label>
          First name:
          <input
            name="first name"
            className="bg-white text-black border border-gray-300 rounded-md p-2"
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
        shouldReloadData={{
          filterValue: true,
          sortInfo: true,
        }}
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
}

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
          components={{
            RowDetail,
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

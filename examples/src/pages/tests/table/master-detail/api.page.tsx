import * as React from 'react';

import {
  DataSourceData,
  InfiniteTable,
  InfiniteTablePropColumns,
  DataSource,
  RowDetailStateObject,
  InfiniteTableApi,
  RowDetailState,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  city: string;
  currency: string;
  country: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  salary: number;
};

type City = {
  id: number;
  name: string;
  country: string;
};

const masterColumns: InfiniteTablePropColumns<City> = {
  id: {
    field: 'id',
    header: 'ID',
    defaultWidth: 70,
    type: 'number',
    renderRowDetailIcon: true,
  },
  country: { field: 'country', header: 'Country' },
  city: { field: 'name', header: 'City', defaultFlex: 1 },
};

const detailColumns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },

  stack: { field: 'stack' },
  currency: { field: 'currency' },
  city: { field: 'city' },
};

const domProps = {
  style: {
    height: '100%',
  },
};

function renderDetail() {
  return (
    <DataSource<Developer>
      data={detailDataSource}
      primaryKey="id"
      shouldReloadData={{
        sortInfo: true,
        filterValue: true,
      }}
    >
      <InfiniteTable<Developer>
        columnDefaultWidth={150}
        columnMinWidth={50}
        columns={detailColumns}
      />
    </DataSource>
  );
}

export default () => {
  const [rowDetailState, setRowDetailState] = React.useState<
    RowDetailStateObject<any>
  >({
    collapsedRows: true as const,
    expandedRows: [],
  });

  const onRowDetailStateChange = React.useCallback(
    (rowDetailState: RowDetailState) => {
      setRowDetailState(rowDetailState.getState());
    },
    [],
  );

  const [api, setApi] = React.useState<InfiniteTableApi<City> | null>(null);

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexFlow: 'row',
          color: 'var(--infinite-cell-color)',
          background: 'var(--infinite-background)',
          maxHeight: 200,
          overflow: 'auto',
          gap: 10,
        }}
      >
        <code style={{ paddingInline: 10 }}>
          <pre>Row detail state: {JSON.stringify(rowDetailState, null, 2)}</pre>
        </code>
        <div
          style={{
            display: 'flex',
            gap: 10,
            padding: 10,
            alignItems: 'flex-start',
          }}
        >
          <button onClick={() => api?.rowDetailApi.expandAllDetails()}>
            Expand All
          </button>
          <button onClick={() => api?.rowDetailApi.collapseAllDetails()}>
            Collapse All
          </button>
        </div>
      </div>
      <DataSource<City>
        data={citiesDataSource}
        primaryKey="id"
        defaultSortInfo={[
          {
            field: 'country',
            dir: 1,
          },
          {
            field: 'name',
            dir: 1,
          },
        ]}
      >
        <InfiniteTable<City>
          domProps={domProps}
          onReady={({ api }) => {
            setApi(api);
          }}
          columnDefaultWidth={150}
          rowDetailCache={false}
          rowDetailState={rowDetailState}
          onRowDetailStateChange={onRowDetailStateChange}
          columnMinWidth={50}
          columns={masterColumns}
          rowDetailRenderer={renderDetail}
        />
      </DataSource>
    </>
  );
};

// fetch an array of cities from the server
const citiesDataSource: DataSourceData<City> = () => {
  const cityNames = new Set<string>();
  const result: City[] = [];
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql`)
    .then((response) => response.json())
    .then((response) => {
      response.data.forEach((data: Developer) => {
        if (cityNames.has(data.city)) {
          return;
        }
        cityNames.add(data.city);
        result.push({
          name: data.city,
          country: data.country,
          id: result.length,
        });
      });

      return result;
    });
};

const detailDataSource: DataSourceData<Developer> = ({
  filterValue,
  sortInfo,
  masterRowInfo,
}) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }

  if (!filterValue) {
    filterValue = [];
  }
  if (masterRowInfo) {
    // filter by master country and city
    filterValue = [
      {
        field: 'city',
        filter: {
          operator: 'eq',
          type: 'string',
          value: masterRowInfo.data.name,
        },
      },
      {
        field: 'country',
        filter: {
          operator: 'eq',
          type: 'string',
          value: masterRowInfo.data.country,
        },
      },
      ...filterValue,
    ];
  }
  const args = [
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,

    filterValue
      ? 'filterBy=' +
        JSON.stringify(
          filterValue.map(({ field, filter }) => {
            return {
              field: field,
              operator: filter.operator,
              value:
                filter.type === 'number' ? Number(filter.value) : filter.value,
            };
          }),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');

  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?` + args)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

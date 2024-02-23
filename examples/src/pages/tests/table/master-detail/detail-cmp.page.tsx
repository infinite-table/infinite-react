import * as React from 'react';

import {
  DataSourceData,
  InfiniteTable,
  InfiniteTablePropColumns,
  DataSource,
  RowDetailStateObject,
  InfiniteTableApi,
  RowDetailState,
  useMasterRowInfo,
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
    renderRowDetailIcon: true,
  },
  country: { field: 'country', header: 'Country' },
  city: { field: 'name', header: 'City', defaultFlex: 1 },
};

const detailColumns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
    renderRowDetailIcon: true,
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

function RowDetail() {
  const rowInfo = useMasterRowInfo<City>()!;
  if (!rowInfo) {
    return null;
  }

  return (
    <DataSource<Developer>
      data={detailDataSource}
      primaryKey="id"
      sortMode="remote"
      filterMode="remote"
      defaultFilterValue={[]}
    >
      <InfiniteTable<Developer>
        columnDefaultWidth={150}
        columnMinWidth={50}
        columns={detailColumns}
        getContextMenuItems={() => {
          return [
            {
              key: 'x',
              label: 'child 1',
            },
            {
              key: 'y',
              label: 'child 2',
            },
            {
              key: 'z',
              label: 'child 3',
            },
            {
              key: 'a',
              label: 'child 4',
            },
            {
              key: 'b',
              label: 'child 5',
            },
            {
              key: 'c',
              label: 'child 6',
            },
            {
              key: 'd',
              label: 'child 7',
            },
            {
              key: 'e',
              label: 'child 8',
            },
            {
              key: 'f',
              label: 'child 9',
            },
            {
              key: 'g',
              label: 'child 10',
            },
          ];
        }}
        components={{
          RowDetail,
        }}
      />
    </DataSource>
  );
}

export default () => {
  const [rowDetailState, setRowDetailState] = React.useState<
    RowDetailStateObject<any>
  >({
    collapsedRows: true as const,
    expandedRows: [39, 54],
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
        debugId="x"
        defaultFilterValue={[]}
        data={citiesDataSource}
        primaryKey="id"
        filterMode="local"
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
          rowDetailState={rowDetailState}
          onRowDetailStateChange={onRowDetailStateChange}
          columnMinWidth={50}
          rowDetailHeight={200}
          columns={masterColumns}
          getCellContextMenuItems={() => {
            return [
              {
                key: 'x',
                label: 'Custom Menu Item',
                onClick: () => {
                  alert('Custom Menu Item Clicked');
                },
              },
            ];
          }}
          components={{
            RowDetail,
          }}
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

import * as React from 'react';

import {
  DataSourceData,
  InfiniteTable,
  InfiniteTablePropColumns,
  DataSource,
  InfiniteTableRowInfo,
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

function renderDetail(rowInfo: InfiniteTableRowInfo<City>) {
  console.log('rendering detail for master row', rowInfo.id);
  return (
    <DataSource<Developer>
      data={detailDataSource}
      primaryKey="id"
      sortMode="remote"
      filterMode="remote"
    >
      <InfiniteTable<Developer>
        columnDefaultWidth={150}
        columnMinWidth={50}
        columns={detailColumns}
      />
    </DataSource>
  );
}

const defaultRowDetailState = {
  collapsedRows: true as const,
  expandedRows: [39, 54],
};

export default () => {
  return (
    <>
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
          columnDefaultWidth={150}
          defaultRowDetailState={defaultRowDetailState}
          columnMinWidth={50}
          columns={masterColumns}
          rowDetailCache={5}
          rowDetailHeight={200}
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
    .then(
      (data: Developer[]) =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(data);
          }, 500);
        }),
    );
};

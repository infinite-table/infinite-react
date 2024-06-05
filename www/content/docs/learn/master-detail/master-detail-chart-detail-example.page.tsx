import * as React from 'react';

import {
  DataSourceData,
  InfiniteTable,
  InfiniteTablePropColumns,
  DataSource,
  InfiniteTableRowInfo,
  InfiniteTable_HasGrouping_RowInfoGroup,
  DataSourcePropGroupBy,
  DataSourcePropAggregationReducers,
} from '@infinite-table/infinite-react';

import { AgChartsReact } from 'ag-charts-react';

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

const domProps = {
  style: {
    height: '100%',
  },
};

function renderDetail(rowInfo: InfiniteTableRowInfo<City>) {
  const [groupBy] = React.useState<DataSourcePropGroupBy<Developer>>([
    { field: 'stack' },
  ]);
  const [aggregationReducers] = React.useState<
    DataSourcePropAggregationReducers<Developer>
  >({
    salary: {
      field: 'salary',
      initialValue: 0,
      reducer: (acc, value) => acc + value,
      done: (value, arr) => Math.round(arr.length ? value / arr.length : 0),
    },
  });
  return (
    <div
      style={{
        padding: 10,
        color: 'var(--infinite-cell-color)',
        background: 'var(--infinite-background)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/**
       * In this example, we leverage the DataSource aggregation and grouping feature to
       * calculate the average salary by stack for the selected city.
       */}
      <DataSource<Developer>
        data={detailDataSource}
        primaryKey="id"
        groupBy={groupBy}
        aggregationReducers={aggregationReducers}
      >
        {/**
         * Notice here we're not rendering an InfiniteTable component
         * but rather we use a render function to access the aggregated data.
         */}
        {(params) => {
          const { dataArray: rowInfoArray } = params;
          const groups = rowInfoArray.filter(
            (rowInfo) => rowInfo.isGroupRow,
          ) as InfiniteTable_HasGrouping_RowInfoGroup<Developer>[];
          const groupData = groups.map((group) => {
            return {
              stack: group.data?.stack,
              avgSalary: group.reducerData?.salary,
            };
          });

          return (
            <AgChartsReact
              options={{
                autoSize: true,
                title: {
                  text: `Avg salary by stack in ${rowInfo.data?.name}, ${rowInfo.data?.country}`,
                },
                data: groupData,
                series: [
                  {
                    type: 'bar',
                    xKey: 'stack',
                    yKey: 'avgSalary',
                    yName: 'Average Salary',
                  },
                ],
              }}
            />
          );
        }}
      </DataSource>
    </div>
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
          rowDetailHeight={320}
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

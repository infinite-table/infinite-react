import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
  DataSourceData,
  useInfiniteColumnCell,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';
import { useMemo } from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
};

const dataSource: DataSourceData<Developer> = ({}) => {
  return [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Bobson',
      country: 'USA',
      city: 'LA',
      currency: 'USD',
    },
    {
      id: 2,
      firstName: 'Bill',
      lastName: 'Richardson',
      country: 'USA',
      city: 'NY',
      currency: 'USD',
    },
    {
      id: 3,
      firstName: 'Nat',
      lastName: 'Natson',
      country: 'Canada',
      city: 'Montreal',
      currency: 'CAD',
    },
  ];
};

export default () => {
  const columns = useMemo<InfiniteTablePropColumns<Developer>>(() => {
    return {
      firstName: {
        field: 'firstName',
        defaultWidth: 200,
      },
      city: {
        field: 'city',
      },

      currency: {
        field: 'currency',
        renderGroupValue: ({ rowInfo }) => {
          return <>{rowInfo.value}</>;
        },
      },
      country: {
        field: 'country',
        renderGroupValue: ({ rowInfo }) => {
          return <>Group: {rowInfo.value}</>;
        },
        renderLeafValue: ({ value }) => {
          return <>Country: {value}</>;
        },
        render: () => {
          const { renderBag } = useInfiniteColumnCell();

          return <button>{renderBag.value}</button>;
        },
      },
    };
  }, []);
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer>
          data={dataSource}
          primaryKey="id"
          defaultGroupRowsState={{
            expandedRows: true,
            collapsedRows: [],
          }}
          groupBy={[
            {
              field: 'country',
              column: {
                renderGroupIcon: ({ renderBag }) => {
                  return <button>{renderBag.groupIcon}</button>;
                },
              },
            },
          ]}
        >
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
            columnDefaultWidth={180}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};

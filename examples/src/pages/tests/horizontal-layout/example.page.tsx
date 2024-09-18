import * as React from 'react';

import {
  DataSourceApi,
  InfiniteTable,
  InfiniteTableColumn,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  country: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
  salary: number;
};

// const _COLORS = [
//   `rgb(237,28,36, 15%)`,
//   `rgb(55,126,184, 15%)`,
//   `rgb(70,203,118, 15%)`,
// ];

const style: InfiniteTableColumn<any>['style'] = (
  {
    // data,
    // rowInfo,
    // horizontalLayoutPageIndex,
    // rowIndexInHorizontalLayoutPage,
  },
) => {
  return {
    // background: COLORS[horizontalLayoutPageIndex! % COLORS.length],
  };
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    style,
    renderValue: ({ value, rowInfo, rowIndexInHorizontalLayoutPage }) => {
      return (
        <>
          ID: {value}, index {rowInfo.indexInAll} inde xin page{' '}
          {rowIndexInHorizontalLayoutPage}
        </>
      );
    },
  },
  canDesign: {
    field: 'canDesign',
    style,
  },
  salary: {
    field: 'salary',
    type: 'number',
    style,
  },
  firstName: {
    field: 'firstName',
    style,
  },
  age: {
    field: 'age',
    type: 'number',
    style,
  },

  stack: { field: 'stack', renderMenuIcon: false, style },
  currency: { field: 'currency', style },
  country: { field: 'country', style },
};

const render: InfiniteTableColumn<Developer>['render'] = ({
  rowIndexInHorizontalLayoutPage,
  rowInfo,
  renderBag,
}) => {
  if (rowInfo.isGroupRow) {
    return (
      <>
        {renderBag.groupIcon}
        {renderBag.value}
      </>
    );
  }
  if (rowIndexInHorizontalLayoutPage === 0) {
    return (
      <>
        {renderBag.groupIcon}
        {renderBag.value}
      </>
    );
  }
  return null;
};

const renderValue: InfiniteTableColumn<Developer>['renderValue'] = ({
  value,
  rowInfo,
  column,
  rowIndexInHorizontalLayoutPage,
}) => {
  if (rowInfo.isGroupRow) {
    return value;
  }
  if (!rowInfo.dataSourceHasGrouping) {
    return null;
  }
  const groupKeys = rowInfo.groupKeys;
  if (
    rowIndexInHorizontalLayoutPage == null ||
    rowIndexInHorizontalLayoutPage > groupKeys.length
  ) {
    return null;
  }

  return `(${groupKeys[column.computedVisibleIndex]})`;
};
export default () => {
  const dataSource = React.useCallback(() => {
    return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
      .then((r) => r.json())
      .then((data) => {
        return data;
        // return new Promise((resolve) => {
        //   setTimeout(() => {
        //     resolve(data);
        //   }, 10);
        // });
      });
  }, []);

  const [dataSourceApi, setDataSourceApi] =
    React.useState<DataSourceApi<Developer> | null>(null);
  return (
    <>
      <button
        onClick={() => {
          dataSourceApi?.updateData({
            id: 16,
            salary: 10,
            stack: 'frontend',
            firstName: 'xxx',
          });
        }}
      >
        update
      </button>
      <React.StrictMode>
        <DataSource<Developer>
          onReady={setDataSourceApi}
          data={dataSource}
          primaryKey="id"
          defaultGroupBy={[
            {
              field: 'currency',
              column: {
                // defaultWidth: 150,
                // style,
                render,
                renderValue,
              },
            },
            {
              field: 'stack',
              column: {
                style,
                render,
                renderValue,
              },
            },
          ]}
        >
          <InfiniteTable<Developer>
            columns={columns}
            wrapRowsHorizontally={true}
            columnDefaultWidth={120}
            domProps={{
              style: {
                minHeight: '70vh',
              },
            }}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};

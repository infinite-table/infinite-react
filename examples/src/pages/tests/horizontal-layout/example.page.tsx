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

const COLORS = [
  `rgb(237,28,36, 15%)`,
  `rgb(132,60,17, 15%)`,
  `rgb(50,14,5, 15%)`,
];

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

const header: InfiniteTableColumn<Developer>['header'] = ({
  horizontalLayoutPageIndex,
  column,
}) => {
  return (
    <b>
      {column.field} - {horizontalLayoutPageIndex}
    </b>
  );
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    defaultEditable: false,
    columnGroup: 'colgroup',
    header,
    style,
  },
  canDesign: {
    field: 'canDesign',
    columnGroup: 'colgroup',
    style,
    header,
  },
  salary: {
    field: 'salary',
    type: 'number',
    columnGroup: 'colgroup',
    style,
    header,
  },
  firstName: {
    field: 'firstName',
    columnGroup: 'colgroup',
    style,
  },
  age: {
    field: 'age',
    type: 'number',
    columnGroup: 'colgroup',
    style,
  },

  stack: {
    field: 'stack',
    renderMenuIcon: false,
    style,
    columnGroup: 'colgroup',
  },
  currency: { field: 'currency', style, columnGroup: 'colgroup' },
  country: { field: 'country', style, columnGroup: 'colgroup' },
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

  const [cols, setCols] = React.useState(columns);
  return (
    <>
      {Object.keys(columns).map((colId) => {
        return (
          <label key={colId}>
            <input
              type="checkbox"
              checked={!!cols[colId]}
              onChange={(e) => {
                setCols((cols) => {
                  const newCols = { ...cols };
                  const checked = e.target.checked;
                  if (checked) {
                    newCols[colId] = columns[colId];
                  } else {
                    delete newCols[colId];
                  }
                  return newCols;
                });
              }}
            />
            {colId}
          </label>
        );
      })}
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
          shouldReloadData={{
            filterValue: false,
          }}
          defaultFilterValue={[]}
          primaryKey="id"
        >
          <InfiniteTable<Developer>
            columns={cols}
            // xcolumnGroups={{
            //   colgroup: {
            //     header: ({ horizontalLayoutPageIndex }) => {
            //       return <>Group {horizontalLayoutPageIndex}</>;
            //     },
            //     style: ({ horizontalLayoutPageIndex }) => {
            //       return {
            //         background:
            //           COLORS[horizontalLayoutPageIndex! % COLORS.length],
            //       };
            //     },
            //   },
            // }}
            wrapRowsHorizontally={true}
            columnDefaultWidth={120}
            columnDefaultEditable
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

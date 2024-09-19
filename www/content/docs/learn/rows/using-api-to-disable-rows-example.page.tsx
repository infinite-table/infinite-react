import * as React from 'react';

import {
  DataSource,
  DataSourceApi,
  DataSourceData,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  salary: number;
};

const data: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 100,
  },
  salary: {
    defaultFilterable: true,
    field: 'salary',
    type: 'number',
  },

  firstName: {
    field: 'firstName',
    renderValue: ({ rowInfo, value }) => {
      return `${value} ${rowInfo.rowDisabled ? '🚫' : ''}`;
    },
  },
  stack: { field: 'stack' },
  currency: { field: 'currency' },
};

export default () => {
  const [dataSourceApi, setDataSourceApi] =
    React.useState<DataSourceApi<Developer>>();
  return (
    <>
      <button
        onClick={() => {
          dataSourceApi?.enableAllRows();
        }}
      >
        Enable all rows
      </button>
      <button
        onClick={() => {
          dataSourceApi?.disableAllRows();
        }}
      >
        Disable all rows
      </button>
      <DataSource<Developer>
        onReady={setDataSourceApi}
        data={data}
        primaryKey="id"
        defaultRowDisabledState={{
          enabledRows: [1, 2, 3, 5],
          disabledRows: true,
        }}
      >
        <InfiniteTable<Developer>
          getCellContextMenuItems={({ rowInfo }, { dataSourceApi }) => {
            return {
              columns: [{ name: 'label' }],
              items: [
                {
                  label: 'Disable row',
                  key: 'disable-row',
                  disabled: rowInfo.rowDisabled,
                  onAction: ({ hideMenu }) => {
                    dataSourceApi.setRowEnabledAt(rowInfo.indexInAll, false);
                    hideMenu();
                  },
                },
                {
                  label: 'Enable row',
                  key: 'enable-row',
                  disabled: !rowInfo.rowDisabled,
                  onAction: ({ hideMenu }) => {
                    dataSourceApi.setRowEnabled(rowInfo.id, true);
                    hideMenu();
                  },
                },
                {
                  label: 'Toggle row disable/enable',
                  key: 'toggle-row-disable-enable',
                  onAction: ({ hideMenu }) => {
                    dataSourceApi.setRowEnabled(
                      rowInfo.id,
                      rowInfo.rowDisabled,
                    );
                    hideMenu();
                  },
                },
              ],
            };
          }}
          columnDefaultWidth={120}
          columnMinWidth={50}
          columns={columns}
          keyboardNavigation="row"
        />
      </DataSource>
    </>
  );
};

import * as React from 'react';

import {
  DataSource,
  DataSourceData,
  InfiniteTable,
  InfiniteTablePropColumns,
  RowDisabledStateObject,
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
  },
  stack: { field: 'stack' },
  currency: { field: 'currency' },
};

export default () => {
  const [rowDisabledState, setRowDisabledState] = React.useState<
    RowDisabledStateObject<number>
  >({
    enabledRows: true,
    disabledRows: [1, 3, 4, 5],
  });
  return (
    <>
      <DataSource<Developer>
        data={data}
        primaryKey="id"
        rowDisabledState={rowDisabledState}
        onRowDisabledStateChange={(rowState) => {
          setRowDisabledState(rowState.getState());
        }}
      >
        <InfiniteTable<Developer>
          getCellContextMenuItems={({ rowInfo }, { dataSourceApi }) => {
            const rowDisabled = dataSourceApi.isRowDisabledAt(
              rowInfo.indexInAll,
            );
            return {
              columns: [{ name: 'label' }],
              items: [
                {
                  label: 'Disable row',
                  disabled: rowDisabled,
                  key: 'disable-row',
                  onAction: ({ hideMenu }) => {
                    dataSourceApi.setRowEnabledAt(rowInfo.indexInAll, false);
                    hideMenu();
                  },
                },
                {
                  label: 'Enable row',
                  disabled: !rowDisabled,
                  key: 'enable-row',
                  onAction: ({ hideMenu }) => {
                    dataSourceApi.setRowEnabled(rowInfo.id, true);
                    hideMenu();
                  },
                },
                {
                  label: 'Toggle row enable/disable',
                  key: 'toggle-row',
                  onAction: ({ hideMenu }) => {
                    dataSourceApi.setRowEnabled(
                      rowInfo.id,
                      dataSourceApi.isRowDisabled(rowInfo.id),
                    );
                    hideMenu();
                  },
                },
              ],
            };
          }}
          keyboardNavigation="row"
          columnDefaultWidth={120}
          columnMinWidth={50}
          columns={columns}
        />
      </DataSource>
    </>
  );
};

import * as React from 'react';
import {
  useCallback,
  useRef,
  useEffect,
  useState,
} from 'react';

import {
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';

import type {
  DataSourceProps,
  InfiniteTableProps,
  InfiniteTableApi,
  InfiniteTablePropColumns,
  DataSourcePropRowSelection_MultiRow,
} from '@infinite-table/infinite-react';

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
  },
  firstName: {
    field: 'firstName',
    defaultHiddenWhenGroupedBy: '*',
  },
  stack: {
    field: 'stack',
    renderGroupValue: ({ value }) =>
      `Stack: ${value || ''}`,
  },
  age: { field: 'age' },
  id: { field: 'id' },
  preferredLanguage: {
    field: 'preferredLanguage',
    renderGroupValue: ({ value }) => `Lang: ${value || ''}`,
  },
  canDesign: {
    field: 'canDesign',
    renderGroupValue: ({ value }) =>
      `Can design: ${value || ''}`,
  },
};

const defaultGroupBy: DataSourceProps<Developer>['groupBy'] =
  [
    {
      field: 'canDesign',
    },
    {
      field: 'stack',
    },
    {
      field: 'preferredLanguage',
    },
  ];

const groupColumn: InfiniteTableProps<Developer>['groupColumn'] =
  {
    field: 'firstName',
    renderSelectionCheckBox: true,
    defaultWidth: 300,
  };

const domProps = {
  style: {
    flex: 1,
    minHeight: 500,
  },
};

export default function App() {
  const apiRef = useRef<InfiniteTableApi<Developer> | null>(
    null
  );
  const [rowSelection, setRowSelection] =
    useState<DataSourcePropRowSelection_MultiRow>({
      selectedRows: [
        ['yes', 'backend', 'TypeScript'],
        4,
        ['yes', 'frontend'],
      ],
      deselectedRows: [4, 2],
      defaultSelection: false,
    });

  const [selectedIds, setSelectedIds] = useState<string[]>(
    []
  );

  const onReady = useCallback(
    (api: InfiniteTableApi<Developer>) => {
      apiRef.current = api;

      setSelectedIds(
        api.selectionApi.getSelectedPrimaryKeys(
          rowSelection
        ) as string[]
      );
    },
    []
  );

  useEffect(() => {
    if (!apiRef.current) {
      return;
    }
    setSelectedIds(
      apiRef.current.selectionApi.getSelectedPrimaryKeys(
        rowSelection
      ) as string[]
    );
  }, [rowSelection]);
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        overflow: 'auto',
        color: 'var(--infinite-cell-color)',
        flexFlow: 'column',
        background: 'var(--infinite-background)',
      }}>
      <div
        style={{
          padding: 10,
        }}>
        Current row selection:
        <code
          style={{
            display: 'block',
            height: 300,
            overflow: 'auto',
            border: '1px dashed currentColor',
          }}>
          <pre>
            {' '}
            {JSON.stringify(rowSelection, null, 2)}.
          </pre>
        </code>
        Current selected ids: {selectedIds.join(', ')}
      </div>

      <DataSource<Developer>
        data={dataSource}
        groupBy={defaultGroupBy}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        useGroupKeysForMultiRowSelection
        primaryKey="id">
        <InfiniteTable<Developer>
          onReady={onReady}
          columns={columns}
          domProps={domProps}
          hideColumnWhenGrouped
          groupColumn={groupColumn}
          columnDefaultWidth={150}
        />
      </DataSource>
    </div>
  );
}

const dataSource = () => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/developers100'
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

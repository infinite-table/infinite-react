import * as React from 'react';

import {
  InfiniteTablePropColumns,
  InfiniteTable,
  DataSource,
  DataSourcePropRowSelection_MultiRow,
} from '@infinite-table/infinite-react';


import { useState } from 'react';

import { data, height80vhDomProps, type Developer } from './common';

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
    renderSelectionCheckBox: true,
  },
  lastName: {
    field: 'lastName',
  },
  stack: {
    field: 'stack',
  },
  preferredLanguage: {
    field: 'preferredLanguage',
  },
  age: {
    field: 'age',
  },
  canDesign: {
    field: 'canDesign',
  },
};

export default function GroupByExample() {
  const [rowSelection, setRowSelection] = useState<
    DataSourcePropRowSelection_MultiRow | undefined
  >(undefined);

  (globalThis as any).rowSelection = rowSelection;

  return (
    <>
      <button
        onClick={() => {
          setRowSelection({
            selectedRows: [2, 3],
            defaultSelection: false,
          });
        }}
      >
        set selection
      </button>
      <DataSource<Developer>
        primaryKey="id"
        data={data}
        selectionMode="multi-row"
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      >
        <InfiniteTable<Developer>
          domProps={height80vhDomProps}
          columns={columns}
          keyboardSelection={true}
          keyboardNavigation={'cell'}
          columnDefaultWidth={200}
        />
      </DataSource>
    </>
  );
}

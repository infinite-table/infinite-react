import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropRowSelection_MultiRow,
  InfiniteTablePropGroupColumn,
  DataSourcePropGroupBy,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

import { useState } from 'react';

type Developer = {
  id: number;

  stack: string;
  language: string;
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },

  stack: {
    field: 'stack',
  },

  language: {
    field: 'language',
  },
};

const domProps = {
  style: {
    height: '80vh',
  },
};

const groupColumn: InfiniteTablePropGroupColumn<Developer> = {
  field: 'id',
  // align: 'end',
  // renderValue: (arg) => {
  //   const { groupByColumn, value } = arg;

  //   if (!groupByColumn) {
  //     return <>{value}</>;
  //   }

  //   return <>{groupByColumn.renderValue?.(arg) ?? arg.value}</>;
  // },
};

const dataSource: Developer[] = [
  {
    id: 10,
    stack: 'backend',
    language: 'TypeScript',
  },
  {
    id: 11,
    stack: 'backend',
    language: 'TypeScript',
  },
  {
    id: 12,
    stack: 'backend',
    language: 'TypeScript',
  },
  {
    id: 13,
    stack: 'backend',
    language: 'Rust',
  },
  // {
  //   id: 14,
  //   stack: 'backend',
  //   language: 'Rust',
  // },
  // {
  //   id: 15,
  //   stack: 'backend',
  //   language: 'Rust',
  // },
  // { id: 16, stack: 'backend', language: 'go' },
  // { id: 17, stack: 'frontend', language: 'ts' },
];
const currentGroupBy: DataSourcePropGroupBy<Developer> = [
  {
    field: 'stack',
  },
  { field: 'language' },
];
export default function GroupByExample() {
  const [rowSelection, setRowSelection] =
    useState<DataSourcePropRowSelection_MultiRow>({
      defaultSelection: false,
      selectedRows: [10, 11, 12],
      deselectedRows: [],
    });

  return (
    <>
      <div>
        <pre>
          <code>{JSON.stringify(rowSelection)}</code>
        </pre>
      </div>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        selectionMode="multi-row"
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        // selectionMode="multi-row" | 'single-row' | multi-cell | single-cell
        // multiRowSelection={{}}
        // singleRowSelection={{}}
        // rowSelection={{

        // }}

        // onRowSelectionChange={({rowSection, selectionType: 'multi-row'})} {
        //   if (selectionType == 'multi-row') {
        //     // rowSection
        //   } else {
        //     rowSelection
        //   }
        // }

        // onSingleRowSelectionChange={(newId)=>{}}
        // singleCellSelection={[rowId, colId]}
        // onSingleCellSelectionChange={([rowId, colId]) => {

        // }}
        // multiCellSelection={{
        //   selectedCells: {

        //   },
        //   deselectedCells: true
        // }}
        // onMultiCellSelectionChange={....}
      >
        <InfiniteTable<Developer>
          domProps={domProps}
          columns={columns}
          keyboardNavigation="row"
          groupRenderStrategy="single-column"
          hideColumnWhenGrouped
          onColumnOrderChange={(columnOrder) => {
            console.log(columnOrder);
          }}
          // groupColumn={{
          //   field: 'firstName',
          // }}
          groupColumn={groupColumn}
          columnDefaultWidth={200}
        />
      </DataSource>
    </>
  );
}

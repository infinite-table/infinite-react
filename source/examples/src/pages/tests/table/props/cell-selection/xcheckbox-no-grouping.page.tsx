import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropRowSelection_MultiRow,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

import { useState } from 'react';
import { RowSelectionState } from '@infinite-table/infinite-react/components/DataSource/RowSelectionState';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  checkbox: {
    defaultWidth: 40,
    align: 'center',
    resizable: false,
    header: 'x',
    style: {
      cursor: 'pointer',
    },
    // render: ({ rowInfo }) => {
    //   return (
    //     <input
    //       type="checkbox"
    //       style={{
    //         cursor: 'pointer',
    //       }}
    //       checked={rowInfo.rowSelected as boolean}
    //       onChange={() => {}}
    //     />
    //   );
    // },
    renderSelectionCheckBox: true,
  },
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
    renderSelectionCheckBox: true,
  },

  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const domProps = {
  style: {
    height: '80vh',
  },
};

export default function GroupByExample() {
  const [rowSelection, _setRowSelection] =
    useState<DataSourcePropRowSelection_MultiRow>({
      selectedRows: [2, 3],
      defaultSelection: false,
    });

  return (
    <>
      <div>
        Selected{' '}
        {rowSelection instanceof RowSelectionState
          ? rowSelection.getSelectedCount()
          : false}
      </div>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        selectionMode="multi-row"
        defaultRowSelection={rowSelection}
        onRowSelectionChange={(args) => {
          console.log(args, '!!');
        }}
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
          columnDefaultWidth={200}
        />
      </DataSource>
    </>
  );
}

import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropRowSelection_MultiRow,
  useInfiniteColumnCell,
  DataSourcePropGroupBy,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

import { useState } from 'react';
import { RowSelectionState } from '@infinite-table/infinite-react';
import { components } from '@infinite-table/infinite-react';

const { CheckBox } = components;

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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => {
      return data;
    });
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
  },

  preferredLanguage: {
    field: 'preferredLanguage',
    renderValue: ({ value }) => `Lang: ${value}`,
    renderGroupValue: ({ renderBag }) => {
      return <>{renderBag.value}----</>;
    },
    renderLeafValue: () => {
      const { renderBag } = useInfiniteColumnCell();
      return <>{renderBag.value}xxxx</>;
    },
    render: ({ renderBag }) => {
      return <>{renderBag.value}!!!</>;
    },
  },
  stack: { field: 'stack' },
};

const domProps = {
  style: {
    height: '80vh',
  },
};

const groupBy = [
  { field: 'stack' },
  {
    field: 'preferredLanguage',
  },
];

export default function GroupByExample() {
  const [rowSelection, setRowSelection] =
    useState<DataSourcePropRowSelection_MultiRow>({
      //@ts-ignore
      // selectedGroups: [
      //   [
      //     'France',
      //     {
      //       deselectedRows: { '21312': true },
      //       selectedGroups: [],
      //     },
      //   ],
      //   ['backend', 'TypeScript'],
      // ],
      selectedRows: {
        0: true,
        1: true,
        2: true,
        3: true,

        // 'backend,TypeScript': true,

        5: true,
        8: true,
        41: true,
      },
      deselectedRows: true,
    });

  const onRowSelectionChange = React.useCallback(({ rowSelection }) => {
    setRowSelection(rowSelection);
  }, []);

  return (
    <>
      <div>
        <CheckBox checked={null}></CheckBox>test Selected{' '}
        {rowSelection instanceof RowSelectionState
          ? rowSelection.getSelectedCount()
          : false}
      </div>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupBy={groupBy as DataSourcePropGroupBy<Developer>}
        selectionMode="multi-row"
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
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
          groupRenderStrategy="single-column"
          groupColumn={{
            field: 'firstName',
          }}
          columnDefaultWidth={200}
        />
      </DataSource>
    </>
  );
}

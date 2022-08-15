import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropRowSelection_MultiRow,
  useInfiniteColumnCell,
  DataSourcePropGroupBy,
  InfiniteTablePropGroupColumn,
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
  stack: {
    field: 'stack',
    renderValue: ({ value }) => {
      return <>x - {value}</>;
    },
  },
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

const groupColumn: InfiniteTablePropGroupColumn<Developer> = {
  field: 'firstName',
  renderValue: (arg) => {
    const { groupBy, columnsMap, rowInfo } = arg;

    const groupByItem =
      groupBy[rowInfo.dataSourceHasGrouping ? rowInfo.groupNesting - 1 : 0];

    if (!groupByItem) {
      return <>{arg.value}</>;
    }

    const groupColumn = columnsMap.get(groupByItem.field);

    // return <>{arg.value}</>;
    // const groupByCol = groupBy
    return <>{groupColumn?.renderValue?.(arg) ?? arg.value}</>;
  },
};

export default function GroupByExample() {
  const [rowSelection, setRowSelection] =
    useState<DataSourcePropRowSelection_MultiRow>({
      // deselectedRows: [['backend', 'TypeScript']],
      defaultSelection: false,
      selectedRows: [],
      deselectedRows: [['backend', 'TypeScript']],
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
          keyboardNavigation="row"
          groupRenderStrategy="single-column"
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

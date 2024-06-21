import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropCellSelection_MultiCell,
  RowSelectionState,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

import { useState } from 'react';

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
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
  },

  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const domProps = {
  style: {
    height: '80vh',
    margin: 10,
  },
};

export default function GroupByExample() {
  const [cellSelection, _setCellSelection] =
    useState<DataSourcePropCellSelection_MultiCell>({
      selectedCells: [
        // [2, 'firstName'],
        ['*', 'firstName'],
        // [7, 'preferredLanguage'],
        // [3, 'id'],
        [3, '*'],
        [4, '*'],
        [5, '*'],
        [11, 'preferredLanguage'],
        [15, 'stack'],
      ],
      // deselectedCells: [[3, 'stack']],
      defaultSelection: false,
    });

  return (
    <>
      <div>
        Selected{' '}
        {cellSelection instanceof RowSelectionState
          ? cellSelection.getSelectedCount()
          : false}
      </div>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        selectionMode="multi-cell"
        // defaultRowSelection={rowSelection}
        // xdefaultCellSelection={[]}

        defaultCellSelection={cellSelection}
      >
        <InfiniteTable<Developer>
          columnPinning={
            {
              // firstName: 'start',
            }
          }
          domProps={domProps}
          columns={columns}
          keyboardSelection={true}
          keyboardNavigation={'cell'}
          columnDefaultWidth={200}
        />
      </DataSource>
    </>
  );
}

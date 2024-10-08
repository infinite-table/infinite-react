import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropCellSelection_MultiCell,
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
  id: { field: 'id', renderSelectionCheckBox: true },

  firstName: {
    field: 'firstName',
  },

  // preferredLanguage: { field: 'preferredLanguage' },
  // stack: { field: 'stack' },
};

const domProps = {
  style: {
    height: '80vh',
    margin: 10,
  },
};

const group_COL = {};

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

  const [wrapRowsHorizontally, setWrapRowsHorizontally] = useState(true);
  const [repeatWrappedGroupRows, setRepeatWrappedGroupRows] = useState(true);
  return (
    <>
      <button
        onClick={() => {
          setWrapRowsHorizontally(!wrapRowsHorizontally);
        }}
      >
        toggle horizontal layout
      </button>
      <button
        onClick={() => {
          setRepeatWrappedGroupRows(!repeatWrappedGroupRows);
        }}
      >
        toggle repeat wrapped group rows
      </button>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        defaultGroupBy={[
          {
            field: 'stack',
          },
          {
            field: 'preferredLanguage',
          },
        ]}
        selectionMode="multi-cell"
        defaultCellSelection={cellSelection}
      >
        <InfiniteTable<Developer>
          domProps={domProps}
          columns={columns}
          groupColumn={group_COL}
          repeatWrappedGroupRows={repeatWrappedGroupRows}
          keyboardSelection={true}
          keyboardNavigation={'cell'}
          wrapRowsHorizontally={wrapRowsHorizontally}
          columnDefaultWidth={200}
        />
      </DataSource>
    </>
  );
}

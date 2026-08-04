import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropCellSelection_MultiCell,
} from '@infinite-table/infinite-react';


import { useState } from 'react';

import {
  columns,
  developers1kDataSource,
  height80vhDomProps,
  type Developer,
} from './common';

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
      <DataSource<Developer>
        primaryKey="id"
        data={developers1kDataSource}
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
          debugId="test"
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

import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropCellSelection_MultiCell,
  InfiniteTableApi,
} from '@infinite-table/infinite-react';


import { useState } from 'react';

import {
  columns,
  developers10DataSource,
  height80vhDomProps,
  type Developer,
} from './common';

export default function App() {
  const [_api, setApi] = useState<InfiniteTableApi<Developer> | null>(null);
  const [cellSelection, _setCellSelection] =
    useState<DataSourcePropCellSelection_MultiCell>({
      selectedCells: [
        [2, 'id'],
        [8, 'preferredLanguage'],
        [5, 'stack'],
      ],
      deselectedCells: [[3, 'stack']],
      defaultSelection: false,
    });

  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={developers10DataSource}
        selectionMode="multi-cell"
        defaultCellSelection={cellSelection}
      >
        <InfiniteTable<Developer>
          onReady={({ api }) => {
            setApi(api);
          }}
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

import {
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';

import * as React from 'react';
import { useState } from 'react';

import {
  activeRowDomProps,
  disabledRowColumns,
  developers10DataSource,
  type Developer,
} from './common';

export default function KeyboardNavigationForRows() {
  const [activeRowIndex, setActiveRowIndex] = useState(0);

  (globalThis as any).activeRowIndex = activeRowIndex;
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={developers10DataSource}
      selectionMode="multi-row"
      isRowDisabled={(rowInfo) =>
        rowInfo.indexInAll === 3 ||
        rowInfo.indexInAll === 5 ||
        rowInfo.indexInAll === 6
      }
    >
      <InfiniteTable<Developer>
        columns={disabledRowColumns}
        activeRowIndex={activeRowIndex}
        onActiveRowIndexChange={setActiveRowIndex}
        keyboardNavigation="row"
        domProps={activeRowDomProps}
      />
    </DataSource>
  );
}

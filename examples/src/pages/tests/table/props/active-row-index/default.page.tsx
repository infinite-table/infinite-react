import {
  InfiniteTable,
  DataSource,
  InfiniteTableApi,
} from '@infinite-table/infinite-react';

import * as React from 'react';
import { useState } from 'react';

import {
  activeRowDomProps,
  defaultColumns,
  developers100DataSource,
  type Developer,
} from './common';

export default function KeyboardNavigationForRows() {
  const [infiniteTableApi, setInfiniteTableApi] =
    useState<InfiniteTableApi<Developer>>();

  return (
    <>
      <button
        onClick={() => {
          infiniteTableApi!.scrollLeft = 100;
        }}
      >
        scroll left = 100
      </button>
      <DataSource<Developer> primaryKey="id" data={developers100DataSource}>
        <InfiniteTable<Developer>
          onReady={({ api }) => {
            setInfiniteTableApi(api);
          }}
          columns={defaultColumns}
          defaultActiveRowIndex={99}
          keyboardNavigation="row"
          domProps={activeRowDomProps}
          columnPinning={{
            stack: true,
          }}
        />
      </DataSource>
    </>
  );
}

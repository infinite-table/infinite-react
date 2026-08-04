import * as React from 'react';

import {
  InfiniteTable,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

import {
  columns,
  data,
  height100DomProps,
  type Developer,
} from './common';

export default () => {
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer> data={data} primaryKey="id">
          <InfiniteTable<Developer>
            domProps={height100DomProps}
            keyboardShortcuts={[
              {
                key: 'Shift+Enter',
                handler: () => {
                  (globalThis as any).working =
                    (globalThis as any).working || 0;
                  (globalThis as any).working++;
                },
              },
            ]}
            keyboardNavigation="cell"
            columnDefaultWidth={150}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};

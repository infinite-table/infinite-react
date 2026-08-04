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

const combinations: number[] = [];
(globalThis as any).combinations = combinations;

function handler(index: number) {
  return () => {
    combinations[index] = combinations[index] || 0;
    combinations[index]++;
  };
}

export default () => {
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer> data={data} primaryKey="id">
          <InfiniteTable<Developer>
            domProps={height100DomProps}
            keyboardShortcuts={[
              {
                key: 'cmd+shift+x',
                handler: handler(0),
              },

              {
                key: 'alt+shift+arrowleft',
                handler: handler(1),
              },
              {
                key: 'Shift+PageDown',
                handler: handler(2),
              },
              {
                key: 'alt+shift+*',
                handler: handler(3),
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

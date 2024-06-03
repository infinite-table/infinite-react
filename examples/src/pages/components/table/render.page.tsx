import * as React from 'react';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-react';

import { InfiniteTableColumn } from '@infinite-table/infinite-react';

interface RenderTest {
  col0: string;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
  col6: string;
  col7: string;
  col8: string;
  col9: string;
  col10: string;
  col11: string;
  col12: string;
  col13: string;
  col14: string;
  col15: string;
  col16: string;
  col17: string;
  col18: string;
  col19: string;
  col20: string;
  col21: string;
  col22: string;
  col23: string;
  col24: string;
  col25: string;
  col26: string;
}

const DATA_COUNT = 1000;
const data: RenderTest[] = [...new Array(DATA_COUNT)].map((_, i) => {
  return {
    col0: `col0 ${i}`,
    col1: `col1 ${i}`,
    col2: `col2 ${i}`,
    col3: `col3 ${i}`,
    col4: `col4 ${i}`,
    col5: `col5 ${i}`,
    col6: `col6 ${i}`,
    col7: `col7 ${i}`,
    col8: `col8 ${i}`,
    col9: `col9 ${i}`,
    col10: `col10 ${i}`,
    col11: `col11 ${i}`,
    col12: `col12 ${i}`,
    col13: `col13 ${i}`,
    col14: `col14 ${i}`,
    col15: `col15 ${i}`,
    col16: `col16 ${i}`,
    col17: `col17 ${i}`,
    col18: `col18 ${i}`,
    col19: `col19 ${i}`,
    col20: `col20 ${i}`,
    col21: `col21 ${i}`,
    col22: `col22 ${i}`,
    col23: `col23 ${i}`,
    col24: `col24 ${i}`,
    col25: `col25 ${i}`,
    col26: `col26 ${i}`,
  };
});

const columns = Object.keys(data[0]).reduce((acc, key) => {
  acc[key] = {
    field: key,
    id: key,
    header: ({ column }) => `${key} ${column.computedVisibleIndex}`,
  } as InfiniteTableColumn<RenderTest>;

  return acc;
}, {} as Record<string, InfiniteTableColumn<RenderTest>>);

export default () => {
  return (
    <React.StrictMode>
      <div>
        <DataSource<RenderTest>
          data={data}
          primaryKey="col1"
          fields={[
            'col0',
            'col1',
            'col2',
            'col3',
            'col4',
            'col5',
            'col6',
            'col7',
            'col8',
            'col9',
            'col10',
            'col11',
            'col12',
            'col13',
            'col14',
            'col15',
            'col16',
            'col17',
            'col18',
            'col19',
            'col20',
            'col21',
            'col22',
            'col23',
            'col24',
            'col25',
            'col26',
          ]}
        >
          <div>
            <InfiniteTable<RenderTest>
              header={false}
              domProps={{
                style: {
                  margin: '5px',
                  height: '75vh',
                  border: '1px solid gray',
                  position: 'relative',
                },
              }}
              rowHeight={40}
              columnDefaultWidth={120}
              columnMinWidth={100}
              columns={columns}
            />
          </div>
        </DataSource>
      </div>
    </React.StrictMode>
  );
};

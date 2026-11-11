import * as React from 'react';

import {
  DataSource,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import {
  COLUMN_WIDTH,
  LargeContentRow,
  makeRows,
  ROW_HEIGHT,
  VERTICAL_ROW_COUNT,
} from './largeContentData';

const columns: InfiniteTablePropColumns<LargeContentRow> = {
  id: { field: 'id', type: 'number' },
  name: { field: 'name' },
  value: { field: 'value', type: 'number' },
  code: { field: 'code' },
  group: { field: 'group' },
};

const domProps = { style: { height: 600, width: 800 } };

export default function App() {
  const [rowCount, setRowCount] = React.useState(VERTICAL_ROW_COUNT);
  const data = React.useMemo(() => makeRows(rowCount), [rowCount]);

  React.useEffect(() => {
    (globalThis as any).setRowCount = setRowCount;
  }, []);

  return (
    <DataSource<LargeContentRow> data={data} primaryKey="id">
      <InfiniteTable<LargeContentRow>
        columns={columns}
        rowHeight={ROW_HEIGHT}
        columnDefaultWidth={COLUMN_WIDTH}
        domProps={domProps}
      />
    </DataSource>
  );
}

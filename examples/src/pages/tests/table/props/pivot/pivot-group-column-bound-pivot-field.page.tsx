import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropAggregationReducers,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  DataSourceGroupBy,
  DataSourcePivotBy,
  InfiniteTablePropGroupRenderStrategy,
} from '@infinite-table/infinite-react';

type Row = {
  id: number;
  region: string;
  label: string;
  segment: string;
  amount: number;
};

const data: Row[] = [
  { id: 1, region: 'NA', label: 'Acme', segment: 'SMB', amount: 10 },
  { id: 2, region: 'NA', label: 'Globex', segment: 'Enterprise', amount: 20 },
  { id: 3, region: 'EMEA', label: 'Acme', segment: 'SMB', amount: 30 },
  { id: 4, region: 'LATAM', label: 'Acme', segment: 'SMB', amount: 5 },
  { id: 5, region: 'LATAM', label: 'Acme', segment: 'Enterprise', amount: 6 },
];

const columns: InfiniteTablePropColumns<Row> = {
  id: { field: 'id' },
  region: { field: 'region' },
  label: { field: 'label' },
  segment: { field: 'segment' },
  amount: { field: 'amount', type: 'number' },
};

const sumReducer: InfiniteTableColumnAggregator<Row, number> = {
  initialValue: 0,
  reducer: (acc, value) => acc + value,
};

const reducers: DataSourcePropAggregationReducers<Row> = {
  amount: {
    ...sumReducer,
    name: 'Amount',
    field: 'amount',
  },
};

const groupBy: DataSourceGroupBy<Row>[] = [
  {
    field: 'region',
    column: {
      field: 'segment',
    },
  },
  { field: 'label' },
];

const pivotBy: DataSourcePivotBy<Row>[] = [{ field: 'segment' }];

export function PivotGroupColumnBoundPivotFieldExample(props: {
  groupRenderStrategy?: InfiniteTablePropGroupRenderStrategy;
}) {
  return (
    <DataSource<Row>
      primaryKey="id"
      data={data}
      groupBy={groupBy}
      pivotBy={pivotBy}
      aggregationReducers={reducers}
    >
      {({ pivotColumns, pivotColumnGroups }) => {
        return (
          <InfiniteTable<Row>
            domProps={{ style: { height: '80vh' } }}
            columns={columns}
            groupRenderStrategy={props.groupRenderStrategy}
            pivotColumns={pivotColumns}
            pivotColumnGroups={pivotColumnGroups}
          />
        );
      }}
    </DataSource>
  );
}

export default function PivotGroupColumnBoundPivotFieldPage() {
  return <PivotGroupColumnBoundPivotFieldExample />;
}

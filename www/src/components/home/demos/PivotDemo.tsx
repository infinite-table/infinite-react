'use client';

import {
  DataSource,
  InfiniteTable,
  type DataSourcePropAggregationReducers,
  type DataSourcePropGroupBy,
  type DataSourcePropPivotBy,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { type Trade, formatMoney, makeTrades } from './data';
import {
  LICENSE_KEY,
  gridDomProps,
  themeClassName,
  useSiteMode,
} from './shared';

import './demo-themes.css';

// the same code as the snippet next to the demo (HomePage.tsx)
const groupBy: DataSourcePropGroupBy<Trade> = [{ field: 'sector' }];
const pivotBy: DataSourcePropPivotBy<Trade> = [{ field: 'region' }];

const sum = (acc: number, value: number) => acc + value;
const reducers: DataSourcePropAggregationReducers<Trade> = {
  pnl: {
    field: 'pnl',
    initialValue: 0,
    reducer: sum,
    name: 'P&L',
    pivotColumn: { defaultFlex: 1, minWidth: 104 },
  },
  notional: {
    field: 'notional',
    initialValue: 0,
    reducer: sum,
    name: 'Notional',
    pivotColumn: { defaultFlex: 1, minWidth: 104 },
  },
};

// the generated pivot columns take their rendering from these
const columns: InfiniteTablePropColumns<Trade> = {
  sector: { field: 'sector', header: 'Sector' },
  region: { field: 'region', header: 'Region' },
  pnl: {
    field: 'pnl',
    header: 'P&L',
    type: 'number',
    align: 'end',
    renderValue: ({ value }) =>
      value == null ? null : (
        <span className={value < 0 ? 'home-down' : 'home-up'}>
          {formatMoney(value)}
        </span>
      ),
  },
  notional: {
    field: 'notional',
    header: 'Notional',
    type: 'number',
    align: 'end',
    renderValue: ({ value }) => (value == null ? null : formatMoney(value)),
  },
};

export default function PivotDemo() {
  const mode = useSiteMode();
  const data = React.useMemo(() => makeTrades(20_000), []);
  return (
    <div className="home-demo__card">
      <div
        className={`home-demo__grid home-grid--site ${themeClassName(
          'terminal',
          mode,
        )}`}
      >
        <DataSource<Trade>
          data={data}
          primaryKey="id"
          groupBy={groupBy}
          pivotBy={pivotBy}
          aggregationReducers={reducers}
        >
          {({ pivotColumns, pivotColumnGroups }) => (
            <InfiniteTable<Trade>
              columns={columns}
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              pivotTotalColumnPosition="end"
              domProps={gridDomProps}
              columnDefaultWidth={128}
              groupColumn={{ header: 'Sector', defaultWidth: 170 }}
              licenseKey={LICENSE_KEY}
            />
          )}
        </DataSource>
      </div>
    </div>
  );
}

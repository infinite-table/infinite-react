import {
  createFlashingColumnCellComponent,
  DataSource,
  DataSourceApi,
  DataSourceGroupBy,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import {
  formatNumber,
  Instrument,
  instruments,
  tickInstrument,
} from './themeDemoData';

const FlashingCell = createFlashingColumnCellComponent({
  flashDuration: 800,
});

const numberColumn = (
  field: keyof Instrument,
  header: string,
  decimals = 2,
  flashing = false,
) => ({
  field,
  header,
  type: 'number',
  defaultWidth: 110,
  renderValue: ({ value }: { value: any }) => formatNumber(value, decimals),
  ...(flashing ? { components: { ColumnCell: FlashingCell } } : {}),
});

const columns: InfiniteTablePropColumns<Instrument> = {
  rowNumber: {
    header: '',
    defaultWidth: 48,
    align: 'center',
    defaultSortable: false,
    renderValue: ({ rowInfo }) =>
      rowInfo.isGroupRow ? '' : `${rowInfo.indexInAll + 1}`,
  },
  symbol: { field: 'symbol', header: 'Symbol', defaultWidth: 100 },
  name: { field: 'name', header: 'Name', defaultWidth: 170 },
  price: numberColumn('price', 'Price', 2, true) as any,
  change: numberColumn('change', 'Chg', 2, true) as any,
  bid: numberColumn('bid', 'Bid', 2, true) as any,
  ask: numberColumn('ask', 'Ask', 2, true) as any,
  volume: numberColumn('volume', 'Volume', 0) as any,
  position: numberColumn('position', 'Position', 0) as any,
  pnl: numberColumn('pnl', 'P&L', 0) as any,
};

const groupBy: DataSourceGroupBy<Instrument>[] = [{ field: 'sector' }];

type Mode = 'light' | 'dark';
type Density = '' | 'compact' | 'comfortable' | 'spacious';

export function ThemeDemo({
  themeName,
  defaultMode = 'light',
}: {
  themeName: string;
  defaultMode?: Mode;
}) {
  const [mode, setMode] = React.useState<Mode>(defaultMode);
  const [density, setDensity] = React.useState<Density>('');
  const [ticking, setTicking] = React.useState(false);
  const [api, setApi] = React.useState<DataSourceApi<Instrument> | null>(null);

  React.useEffect(() => {
    if (!api || !ticking) {
      return;
    }
    const interval = setInterval(() => {
      const rows = api.getRowInfoArray();
      for (let i = 0; i < 4; i++) {
        const rowInfo = rows[Math.floor(Math.random() * rows.length)];
        if (rowInfo && !rowInfo.isGroupRow && rowInfo.data) {
          api.updateData(tickInstrument(rowInfo.data));
        }
      }
    }, 120);
    return () => clearInterval(interval);
  }, [api, ticking]);

  return (
    // the mode className on a wrapper, the theme name on the inner element
    // (in the dev app, the default theme CSS is not in the infinite-table
    // cascade layer, so on an element with the mode className it would win
    // over the layered theme CSS - not the case with the built CSS)
    <div className={`infinite-theme-mode--${mode}`}>
      <div
        id="theme-demo"
        className={[
          `infinite-theme-name--${themeName}`,
          density ? `infinite-density--${density}` : '',
        ].join(' ')}
        style={{
          display: 'flex',
          flexFlow: 'column',
          height: '100vh',
          background: 'var(--infinite-background)',
          color: 'var(--infinite-color)',
        }}
      >
        <div
          style={{ display: 'flex', gap: 8, padding: 8, alignItems: 'center' }}
        >
          <button
            data-name="mode"
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          >
            {mode}
          </button>
          <select
            data-name="density"
            title="density"
            value={density}
            onChange={(e) => setDensity(e.target.value as Density)}
          >
            <option value="">default density</option>
            <option value="compact">compact</option>
            <option value="comfortable">comfortable</option>
            <option value="spacious">spacious</option>
          </select>
          <label>
            <input
              data-name="ticking"
              type="checkbox"
              checked={ticking}
              onChange={(e) => setTicking(e.target.checked)}
            />
            ticking
          </label>
        </div>
        <DataSource<Instrument>
          data={instruments}
          primaryKey="id"
          groupBy={groupBy}
          onReady={setApi}
          defaultSortInfo={[{ field: 'symbol', dir: 1 }]}
          defaultRowSelection={{
            selectedRows: [5, 10, 4],
            defaultSelection: false,
          }}
          selectionMode="multi-row"
        >
          <InfiniteTable<Instrument>
            columns={columns}
            defaultColumnPinning={{ rowNumber: 'start' }}
          keyboardNavigation="cell"
            defaultActiveCellIndex={[2, 4]}
            domProps={{ style: { flex: 1, minHeight: 0 } }}
          />
        </DataSource>
      </div>
    </div>
  );
}

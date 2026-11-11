import {
  createFlashingColumnCellComponent,
  DataSource,
  DataSourceApi,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import '@infinite-table/infinite-react/theme/terminal.css';

type Quote = {
  id: number;
  symbol: string;
  sector: string;
  price: number;
  change: number;
  volume: number;
};

const SECTORS = ['Technology', 'Energy', 'Financials', 'Healthcare'];

const data: Quote[] = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  symbol: `SYM${String(i).padStart(2, '0')}`,
  sector: SECTORS[i % SECTORS.length],
  price: 50 + ((i * 37) % 400),
  change: 0,
  volume: (i * 7919) % 900_000,
}));

const FlashingCell = createFlashingColumnCellComponent({
  flashDuration: 800,
});

const format = (value: number) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const columns: InfiniteTablePropColumns<Quote> = {
  symbol: { field: 'symbol', header: 'Symbol' },
  sector: { field: 'sector', header: 'Sector' },
  price: {
    field: 'price',
    header: 'Price',
    type: 'number',
    renderValue: ({ value }) => format(value),
    components: { ColumnCell: FlashingCell },
  },
  change: {
    field: 'change',
    header: 'Chg',
    type: 'number',
    renderValue: ({ value }) => format(value),
    style: ({ value }) => ({
      color:
        value > 0
          ? 'var(--infinite-success-color)'
          : value < 0
          ? 'var(--infinite-error-color)'
          : undefined,
    }),
  },
  volume: { field: 'volume', header: 'Volume', type: 'number' },
};

export default function App() {
  const [api, setApi] = React.useState<DataSourceApi<Quote> | null>(null);

  React.useEffect(() => {
    if (!api) {
      return;
    }
    const interval = setInterval(() => {
      const quote = data[Math.floor(Math.random() * data.length)];
      const delta = Math.round((Math.random() - 0.5) * quote.price) / 100;
      quote.price = Math.max(1, Math.round((quote.price + delta) * 100) / 100);
      quote.change = Math.round((quote.change + delta) * 100) / 100;
      api.updateData({ id: quote.id, price: quote.price, change: quote.change });
    }, 150);
    return () => clearInterval(interval);
  }, [api]);

  return (
    <div
      className="infinite-theme-name--terminal infinite-theme-mode--dark"
      style={{ display: 'flex', flex: 1 }}
    >
      <DataSource<Quote> data={data} primaryKey="id" onReady={setApi}>
        <InfiniteTable<Quote> columns={columns} columnDefaultWidth={130} />
      </DataSource>
    </div>
  );
}

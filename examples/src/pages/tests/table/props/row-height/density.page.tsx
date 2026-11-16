import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Item = {
  id: number;
  name: string;
};

const data: Item[] = Array.from({ length: 100 }, (_, id) => ({
  id,
  name: `Item ${id}`,
}));

const columns: InfiniteTablePropColumns<Item> = {
  id: { field: 'id' },
  name: { field: 'name' },
};

const densities = ['compact', 'comfortable', 'spacious'] as const;

const domProps = {
  style: {
    height: '60vh',
  },
};

export default function DataTestPage() {
  const [density, setDensity] =
    React.useState<(typeof densities)[number]>('comfortable');

  return (
    <React.StrictMode>
      <div className={`infinite-density--${density}`}>
        {densities.map((value) => (
          <button
            key={value}
            data-name={`density-${value}`}
            onClick={() => setDensity(value)}
          >
            {value}
          </button>
        ))}
        <DataSource<Item> data={data} primaryKey="id">
          {/* no rowHeight: the density drives it */}
          <InfiniteTable<Item> domProps={domProps} columns={columns} />
        </DataSource>
      </div>
    </React.StrictMode>
  );
}

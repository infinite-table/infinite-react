import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { columns, Employee } from './columns';

type Density = 'compact' | 'comfortable' | 'spacious';

const groupRowsState = new GroupRowsState({
  expandedRows: true,
  collapsedRows: [],
});

export default function App() {
  const [density, setDensity] = React.useState<Density>('compact');

  return (
    <div
      className={`infinite-density--${density}`}
      style={{
        display: 'flex',
        flexFlow: 'column',
        flex: 1,
        color: 'var(--infinite-cell-color)',
        background: 'var(--infinite-background)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexFlow: 'row',
          alignItems: 'center',
          gap: 10,
          padding: 10,
        }}
      >
        Density
        <select
          title="Select density"
          value={density}
          onChange={(e) => setDensity(e.target.value as Density)}
        >
          <option value="compact">compact</option>
          <option value="comfortable">comfortable</option>
          <option value="spacious">spacious</option>
        </select>
      </div>
      <DataSource<Employee>
        data={dataSource}
        primaryKey="id"
        groupBy={[{ field: 'department' }]}
        defaultGroupRowsState={groupRowsState}
      >
        {/* no rowHeight specified, so the density drives it */}
        <InfiniteTable<Employee>
          debugId="density-example"
          columns={columns}
        />
      </DataSource>
    </div>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees100').then((r) =>
    r.json(),
  );
};

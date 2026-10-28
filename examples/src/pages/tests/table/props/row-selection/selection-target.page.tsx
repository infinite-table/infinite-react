import * as React from 'react';

import {
  InfiniteTablePropColumns,
  InfiniteTable,
  DataSource,
  DataSourcePropGroupBy,
  DataSourcePropMultiRowSelectionTarget,
} from '@infinite-table/infinite-react';

import { data, height80vhDomProps, type Developer } from './common';

const columns: InfiniteTablePropColumns<Developer> = {
  checkbox: { renderSelectionCheckBox: true, defaultWidth: 80 },
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const groupBy: DataSourcePropGroupBy<Developer> = [{ field: 'stack' }];

const filterFunction = ({ data }: { data: Developer }) =>
  data.preferredLanguage !== 'JavaScript';

type Config = {
  target: DataSourcePropMultiRowSelectionTarget;
  grouped: boolean;
  useGroupKeys: boolean;
};

export default function App() {
  const [config, setConfig] = React.useState<Config>({
    target: 'all',
    grouped: false,
    useGroupKeys: false,
  });
  const [filtered, setFiltered] = React.useState(false);

  (globalThis as any).setConfig = setConfig;
  (globalThis as any).setFiltered = setFiltered;

  return (
    <DataSource<Developer>
      primaryKey="id"
      data={data}
      selectionMode="multi-row"
      multiRowSelectionTarget={config.target}
      useGroupKeysForMultiRowSelection={config.useGroupKeys}
      groupBy={config.grouped ? groupBy : undefined}
      filterFunction={filtered ? filterFunction : undefined}
    >
      <InfiniteTable<Developer> domProps={height80vhDomProps} columns={columns} />
    </DataSource>
  );
}

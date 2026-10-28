import * as React from 'react';

import {
  InfiniteTablePropColumns,
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  preferredLanguage: string;
};

const data: Developer[] = [
  { id: 1, firstName: 'Nya', preferredLanguage: 'Java' },
  { id: 2, firstName: 'Axel', preferredLanguage: 'JavaScript' },
  { id: 3, firstName: 'Gonzalo', preferredLanguage: 'TypeScript' },
  { id: 4, firstName: 'Sherwood', preferredLanguage: 'Java' },
  { id: 5, firstName: 'Mark', preferredLanguage: 'Rust' },
  { id: 6, firstName: 'Alex', preferredLanguage: 'JavaScript' },
];

const columns: InfiniteTablePropColumns<Developer> = {
  checkbox: { renderSelectionCheckBox: true, defaultWidth: 80 },
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
};

export default function App() {
  const [languagePrefix, setLanguagePrefix] = React.useState('Java');

  (globalThis as any).setLanguagePrefix = setLanguagePrefix;

  const filterFunction = React.useMemo(
    () =>
      languagePrefix
        ? ({ data }: { data: Developer }) =>
            data.preferredLanguage.startsWith(languagePrefix)
        : undefined,
    [languagePrefix],
  );

  return (
    <>
      <label style={{ display: 'block', padding: 10, color: 'tomato' }}>
        Language starts with{' '}
        <input
          data-name="language-prefix"
          value={languagePrefix}
          onChange={(event) => setLanguagePrefix(event.target.value)}
        />
      </label>
      <DataSource<Developer>
        primaryKey="id"
        data={data}
        selectionMode="multi-row"
        multiRowSelectionTarget="visible"
        filterFunction={filterFunction}
      >
        <InfiniteTable<Developer>
          domProps={{ style: { height: '60vh' } }}
          columns={columns}
        />
      </DataSource>
    </>
  );
}

import * as React from 'react';

import DataSource, {
  DataSourceSortInfo,
  useDataSource,
} from '@components/DataSource';

import { Person, persons } from './sortPersons';
const Cmp = () => {
  const ds = useDataSource<Person>();

  const { dataArray, loading } = ds;

  return (
    <div>
      {loading ? 'loading' : null}
      {loading ? null : JSON.stringify(dataArray)}
    </div>
  );
};

(globalThis as any).calls = 0;

export default () => {
  const [sortInfo, setSortInfo] = React.useState<DataSourceSortInfo<Person>>({
    dir: 1,
    field: 'age',
  });

  (globalThis as any).setSortInfo = setSortInfo;

  const [enabled, setEnabled] = React.useState(false);
  return (
    <React.StrictMode>
      <p>Currently the sorting is {enabled ? 'enabled' : 'disabled'}</p>
      <button
        onClick={() => {
          setEnabled(!enabled);
        }}
      >
        Toggle - click the toggle to {enabled ? 'disable' : 'enable'} sortInfo
      </button>
      <div id="source">
        <DataSource<Person>
          data={persons}
          primaryKey="id"
          fields={['name', 'id', 'age']}
          sortInfo={sortInfo}
          onSortInfoChange={(sortInfo) => {
            (globalThis as any).calls++;
            if (enabled) {
              setSortInfo(sortInfo);
            }
          }}
        >
          <Cmp />
        </DataSource>
      </div>
    </React.StrictMode>
  );
};

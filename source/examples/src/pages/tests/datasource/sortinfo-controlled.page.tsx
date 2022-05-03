import {
  DataSource,
  DataSourceSortInfo,
  useDataSource,
} from '@infinite-table/infinite-react';
import * as React from 'react';

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

  const onSortInfoChange = React.useCallback(
    (sortInfo: DataSourceSortInfo<Person> | null) => {
      (globalThis as any).calls++;
      console.log(sortInfo);
      if (enabled) {
        setSortInfo(sortInfo);
      }
    },
    [],
  );

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
          onSortInfoChange={onSortInfoChange}
        >
          <Cmp />
        </DataSource>
      </div>
    </React.StrictMode>
  );
};

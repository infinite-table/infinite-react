import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceSortInfo,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { data, type Developer } from './grouped-single-group-column.data';

const defaultSortInfo: DataSourceSortInfo<Developer> = [
  {
    dir: 1,
    id: 'group-by',
    field: ['stack', 'preferredLanguage'],
  },
  // { dir: 1, field: 'age' },
];

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  lastName: {
    field: 'lastName',
  },
  stack: {
    field: 'stack',
    // sortable: true,
  },
  preferredLanguage: {
    field: 'preferredLanguage',
  },
  age: {
    field: 'age',
  },
  canDesign: {
    field: 'canDesign',
  },
};
export default () => {
  const [hideGroupColumns, update] = React.useState(true);
  return (
    <React.StrictMode>
      <>
        <button
          onClick={() => {
            update((c) => !c);
          }}
        >
          {hideGroupColumns ? 'show' : 'hide'}
        </button>
        <DataSource<Developer>
          data={data}
          primaryKey="id"
          defaultSortInfo={defaultSortInfo}
          defaultGroupBy={[
            {
              field: 'stack',
            },
            {
              field: 'preferredLanguage',
            },
          ]}
        >
          <InfiniteTable<Developer>
            domProps={{
              style: {
                margin: '5px',
                height: '80vh',
                border: '1px solid gray',
                position: 'relative',
              },
            }}
            groupRenderStrategy="single-column"
            rowHeight={40}
            hideColumnWhenGrouped={hideGroupColumns}
            columnDefaultWidth={150}
            columns={columns}
          />
        </DataSource>
      </>
    </React.StrictMode>
  );
};

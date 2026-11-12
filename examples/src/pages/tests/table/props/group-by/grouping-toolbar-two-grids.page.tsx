import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  DataSourcePropGroupBy,
} from '@infinite-table/infinite-react';
import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  stack: string;
  age: number;
};

const data: Developer[] = [
  { id: 1, firstName: 'Ana', country: 'Italy', stack: 'frontend', age: 30 },
  { id: 2, firstName: 'Bob', country: 'Italy', stack: 'backend', age: 40 },
  { id: 3, firstName: 'Cid', country: 'France', stack: 'frontend', age: 30 },
  { id: 4, firstName: 'Dan', country: 'France', stack: 'backend', age: 50 },
];

// the first grid does not have the `stack` column, and it has the columns
// in another order
const firstColumns: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName' },
  age: { field: 'age' },
  country: { field: 'country' },
};

const secondColumns: InfiniteTablePropColumns<Developer> = {
  country: { field: 'country' },
  stack: { field: 'stack' },
  firstName: { field: 'firstName' },
};

const domProps = {
  style: {
    margin: 20,
    height: 300,
    border: '1px solid gray',
  },
};

function Grid(props: {
  name: string;
  columns: InfiniteTablePropColumns<Developer>;
}) {
  const [groupBy, setGroupBy] = React.useState<
    DataSourcePropGroupBy<Developer>
  >([]);

  return (
    <div data-name={props.name}>
      <div data-name="group-by">
        {groupBy.map((group) => group.field).join(',') || 'none'}
      </div>
      <DataSource<Developer>
        data={data}
        primaryKey="id"
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
      >
        <InfiniteTable<Developer>
          domProps={domProps}
          columns={props.columns}
          columnDefaultWidth={150}
          columnDefaultGroupable
          groupRenderStrategy="single-column"
        >
          <InfiniteTable.GroupingToolbar />
          <InfiniteTable.Header />
          <InfiniteTable.Body />
        </InfiniteTable>
      </DataSource>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Grid name="first" columns={firstColumns} />
      <Grid name="second" columns={secondColumns} />
    </>
  );
}

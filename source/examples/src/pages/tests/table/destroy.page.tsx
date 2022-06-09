import {
  InfiniteTable,
  DataSource,
  DataSourceData,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import * as React from 'react';

import { useInfiniteTable } from '@infinite-table/infinite-react/components/InfiniteTable/hooks/useInfiniteTable';
import { MatrixBrain } from '@infinite-table/infinite-react/components/VirtualBrain/MatrixBrain';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;

  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

let testBrain: MatrixBrain | undefined;
function setBrain(brain: MatrixBrain) {
  if (!testBrain) {
    testBrain = brain;
    brain.onDestroy(() => {
      (globalThis as any).brainDestroyed = true;
    });
  }
}

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  salary: {
    field: 'salary',
    type: 'number',
    render: ({ value }) => {
      const { componentState } = useInfiniteTable();

      setBrain(componentState.brain);
      return value;
    },
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
};

export default function DestroyExample() {
  const [destroyed, setDestroyed] = React.useState(false);
  return (
    <>
      <button onClick={() => setDestroyed(true)}>destroy</button>
      {!destroyed ? (
        <DataSource<Developer> primaryKey="id" data={dataSource}>
          <InfiniteTable<Developer>
            columns={columns}
            columnDefaultWidth={220}
            domProps={{
              style: { height: '90vh' },
            }}
          />
        </DataSource>
      ) : null}
    </>
  );
}
const dataSource: DataSourceData<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10-sql`).then(
    (r) => r.json(),
  );
};

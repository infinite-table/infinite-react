import * as React from 'react';

import {
  DataSource,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  age: number;
};

const data: Developer[] = [
  { id: 1, firstName: 'John', age: 20 },
  { id: 2, firstName: 'Marry', age: 25 },
  { id: 3, firstName: 'Bill', age: 30 },
];

// whether the wrappers render their children - set from the spec
let open = true;
const listeners = new Set<() => void>();
(globalThis as any).setWrappersOpen = (value: boolean) => {
  open = value;
  listeners.forEach((listener) => listener());
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// renders its children inside a span, when open
function Wrapper(props: { children?: React.ReactNode }) {
  const isOpen = React.useSyncExternalStore(subscribe, () => open);
  return <span data-name="wrapper">{isOpen ? props.children : null}</span>;
}

function Badge() {
  return <span data-name="badge">★</span>;
}

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
    header: () => (
      <Wrapper>
        First <b>name</b>
      </Wrapper>
    ),
    renderValue: ({ value }) => <Wrapper>{value}</Wrapper>,
  },
  age: {
    field: 'age',
    type: 'number',
    renderValue: ({ value }) => (
      <Wrapper>
        {value}
        {' years '}
        <Badge />
      </Wrapper>
    ),
  },
};

const domProps = {
  style: {
    height: '80vh',
  },
};

export default () => {
  return (
    <DataSource<Developer> data={data} primaryKey="id">
      <InfiniteTable<Developer>
        columns={columns}
        columnDefaultWidth={200}
        domProps={domProps}
      />
    </DataSource>
  );
};

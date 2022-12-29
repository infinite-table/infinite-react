import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  InfiniteTableApi,
} from '@infinite-table/infinite-react';
import { useCallback, useRef, useState } from 'react';

type Developer = {
  id: number;
  firstName: string;
  currency: string;
  stack: string;
  hobby: string;
  salary: string;
};
const dataSource: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    currency: 'USD',
    stack: 'frontend',
    hobby: 'gaming',
    salary: 'USD 1000',
  },
  {
    id: 2,
    firstName: 'Jane',
    currency: 'EUR',
    stack: 'backend',
    hobby: 'reading',
    salary: 'EUR 2000',
  },
  {
    id: 3,
    firstName: 'Jack',
    currency: 'GBP',
    stack: 'frontend',
    hobby: 'gaming',
    salary: 'GBP 3000',
  },
  {
    id: 4,
    firstName: 'Jill',
    currency: 'USD',
    stack: 'backend',
    hobby: 'reading',
    salary: 'USD 4000',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80, defaultEditable: false },

  salary: {
    defaultWidth: 320,
    field: 'salary',
    header: 'Salary - edit accepts numbers only',
    style: { color: 'tomato' },
    getValueToEdit: ({ value }) => {
      return parseInt(value.substr(4), 10);
    },
    getValueToPersist: ({ value, data }) => {
      return `${data!.currency} ${parseInt(value, 10)}`;
    },
    shouldAcceptEdit: ({ value }) => {
      return parseInt(value, 10) == value;
    },
  },

  firstName: {
    field: 'firstName',
    header: 'Name',
  },
  currency: {
    field: 'currency',
    header: 'Currency',
  },
};

export default function InlineEditingExample() {
  const [activeRowIndex, setActiveRowIndex] = useState<number>(2);

  const apiRef = useRef<InfiniteTableApi<Developer> | null>(null);
  const onReady = useCallback(
    ({ api }: { api: InfiniteTableApi<Developer> }) => {
      apiRef.current = api;
    },
    [],
  );
  return (
    <>
      <button
        style={{
          border: '1px solid magenta',
          margin: 2,
          padding: 10,
          background: 'var(--infinite-background)',
          color: 'var(--infinite-cell-color)',
        }}
        onClick={() => {
          apiRef.current!.startEdit({
            rowIndex: activeRowIndex,
            columnId: 'salary',
          });
        }}
      >
        Edit the salary column for active row
      </button>

      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          onReady={onReady}
          columns={columns}
          columnDefaultEditable
          activeRowIndex={activeRowIndex}
          onActiveRowIndexChange={setActiveRowIndex}
        />
      </DataSource>
    </>
  );
}

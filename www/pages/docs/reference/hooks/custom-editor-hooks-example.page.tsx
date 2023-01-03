import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  useInfiniteColumnEditor,
} from '@infinite-table/infinite-react';
import { useRef, useCallback } from 'react';

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

const CustomEditor = () => {
  const { initialValue, confirmEdit, cancelEdit } = useInfiniteColumnEditor();

  const domRef = useRef<HTMLInputElement>(null);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key } = event;
    if (key === 'Enter' || key === 'Tab') {
      confirmEdit(domRef.current?.value + 'ABC');
    } else if (key === 'Escape') {
      cancelEdit();
    } else {
      event.stopPropagation();
    }
  }, []);

  return (
    <div
      style={{
        background: '#ad1',
        padding: 5,
        width: '100%',
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
      }}
    >
      <input
        style={{ width: '100%', height: '100%' }}
        autoFocus
        ref={domRef}
        defaultValue={initialValue}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80, defaultEditable: false },

  salary: {
    components: {
      // reference to the custom editor component
      editor: CustomEditor,
    },

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
  return (
    <>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer> columns={columns} columnDefaultEditable />
      </DataSource>
    </>
  );
}

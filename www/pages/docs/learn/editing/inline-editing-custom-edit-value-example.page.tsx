import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

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

  firstName: {
    field: 'firstName',
    header: 'Name',
  },
  salary: {
    field: 'salary',
    header: 'Salary',
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

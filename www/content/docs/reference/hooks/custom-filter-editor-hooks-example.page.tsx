import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
  DataSource,
  components,
  useInfiniteColumnFilterEditor,
} from '@infinite-table/infinite-react';

const { CheckBox } = components;

type Developer = {
  id: number;
  firstName: string;
  canDesign: boolean;
  stack: string;
  hobby: string;
};
const dataSource: Developer[] = [
  {
    id: 1,
    firstName: 'John',

    canDesign: true,
    stack: 'frontend',
    hobby: 'gaming',
  },
  {
    id: 2,
    firstName: 'Jane',

    canDesign: false,
    stack: 'backend',
    hobby: 'reading',
  },
  {
    id: 3,
    firstName: 'Jack',

    canDesign: true,
    stack: 'frontend',
    hobby: 'gaming',
  },
  {
    id: 4,
    firstName: 'Jill',

    canDesign: false,
    stack: 'backend',
    hobby: 'reading',
  },
  {
    id: 5,
    firstName: 'Seb',

    canDesign: false,
    stack: 'backend',
    hobby: 'reading',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 100,
  },
  canDesign: {
    field: 'canDesign',
    filterType: 'bool',
    renderValue: ({ value }) => (value ? 'Yes' : 'No'),
  },
  firstName: {
    field: 'firstName',
  },
  stack: { field: 'stack' },
};

const domProps = {
  style: {
    height: '100%',
  },
};

function BoolFilterEditor() {
  const { value, setValue, className } =
    useInfiniteColumnFilterEditor<Developer>();

  return (
    <div className={className} style={{ textAlign: 'center' }}>
      <CheckBox
        checked={value}
        onChange={(newValue) => {
          if (value === true) {
            // after the value was true, make it go to indeterminate state
            newValue = null;
          }
          if (value === null) {
            // from indeterminate, goto false
            newValue = false;
          }
          setValue(newValue);
        }}
      />
    </div>
  );
}

export default () => {
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer>
          data={dataSource}
          primaryKey="id"
          defaultFilterValue={[]}
          filterDelay={0}
          filterTypes={{
            bool: {
              defaultOperator: 'eq',
              emptyValues: [null],
              components: {
                FilterEditor: BoolFilterEditor,
                FilterOperatorSwitch: () => null,
              },
              operators: [
                {
                  name: 'eq',
                  label: 'Equals',
                  fn: ({ currentValue, filterValue }) =>
                    currentValue === filterValue,
                },
              ],
            },
          }}
        >
          <InfiniteTable<Developer>
            domProps={domProps}
            columnDefaultWidth={150}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};

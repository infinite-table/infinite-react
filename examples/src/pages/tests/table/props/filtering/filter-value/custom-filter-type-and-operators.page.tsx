import * as React from 'react';

import {
  defaultFilterTypes,
  InfiniteTable,
  InfiniteTablePropColumns,
  useInfiniteColumnFilterEditor,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';
import { useEffect } from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;

  isActive: boolean;
};

const data: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Bob',
    age: 20,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
    isActive: true,
  },
  {
    id: 2,
    firstName: 'Marry',
    lastName: 'Bob',
    age: 35,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
    isActive: true,
  },
  {
    id: 3,
    firstName: 'Bill',
    lastName: 'Bobson',
    age: 30,
    canDesign: 'no',
    currency: 'CAD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
    isActive: false,
  },
  {
    id: 4,
    firstName: 'Mark',
    lastName: 'Twain',
    age: 31,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
    isActive: true,
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    age: 29,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
    isActive: false,
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  age: {
    defaultFilterable: true,
    field: 'age',
    // type: 'number',
    filterType: 'custom-number',
  },
  stack: { field: 'stack' },
  currency: { field: 'currency', defaultFilterable: false },
  isActive: {
    field: 'isActive',
    filterType: 'boolean',
  },
};

delete defaultFilterTypes.string;

export default () => {
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer>
          data={data}
          primaryKey="id"
          filterValue={[
            {
              // [age] > 30
              id: 'age',
              filter: {
                operator: 'gtx',
                value: '30',
                type: 'custom-number',
              },
            },
            {
              // [age] > 30
              id: 'age', // derived from QL in stransient state
              filter: {
                operator: 'QL',
                value: '[age] > 30', // pe viitor [age] > 30 AND [age] < 40
                type: 'custom-number',
              },
            },
          ]}
          filterDelay={0}
          filterTypes={{
            'custom-number': {
              defaultOperator: 'gtx',
              emptyValues: ['', null, undefined],
              operators: [
                {
                  name: 'isPopular',
                  components: {
                    FilterEditor: () => {
                      // get '30' from colTransientState
                      return <></>;
                    },
                    Icon: () => {
                      // derive '>' from colTransientState
                      return <></>;
                    },
                  },
                  fn: ({ currentValue, filterValue, emptyValues }) => {
                    // expression string
                    // (alternative) predicateForm

                    // return evaluateExpression('[age] > 30', currentValue);

                    if (
                      emptyValues.includes(currentValue) ||
                      emptyValues.includes(filterValue)
                    ) {
                      return true;
                    }
                    return currentValue > filterValue;
                  },
                },
                {
                  name: 'ltx',
                  fn: ({ currentValue, filterValue, emptyValues }) => {
                    if (
                      emptyValues.includes(currentValue) ||
                      emptyValues.includes(filterValue)
                    ) {
                      return true;
                    }
                    return currentValue < filterValue;
                  },
                },
              ],
            },
            boolean: {
              label: 'Boolean',
              emptyValues: [''],
              defaultOperator: 'IS_TRUE',
              components: {
                FilterEditor: BooleanFilterEditor,
              },
              operators: [
                {
                  label: 'True',
                  components: { Icon: IconTrue },
                  name: 'IS_TRUE',
                  fn: ({ currentValue }) => {
                    return !!currentValue;
                  },
                },
                {
                  label: 'False',
                  components: { Icon: IconFalse },
                  name: 'IS_FALSE',
                  fn: ({ currentValue }) => {
                    return !currentValue;
                  },
                },
              ],
            },
          }}
        >
          <InfiniteTable<Developer>
            domProps={{
              style: {
                height: '100%',
              },
            }}
            columnDefaultWidth={150}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};

export const IconTrue = () => <>T</>;
export const IconFalse = () => <>F</>;

export function BooleanFilterEditor<DATA_TYPE = any>() {
  const { operator, setValue, value, columnFilterValue } =
    useInfiniteColumnFilterEditor<DATA_TYPE>();

  useEffect(() => {
    setValue('afl');
  }, []);

  if (operator?.name === 'IS_TRUE' || operator?.name === 'IS_FALSE') {
    return (
      <label style={{ justifyContent: 'center', width: '100%' }}>
        {operator.label}
      </label>
    );
  }

  return <></>;
}

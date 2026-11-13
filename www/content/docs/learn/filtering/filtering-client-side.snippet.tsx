// Snippets shown on filtering-client-side.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  type DataSourceFilterType,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  age: number;
  salary: number;
};

declare const data: Developer[];

export function FilterValueWithFilterTypes() {
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={data}
      //#region using-filter-types-for-filtervalue
      filterValue={[
        {
          field: 'firstName',
          filter: {
            type: 'string', // #highlight
            operator: 'includes',
            value: 'John'
          }

        },
        {
          field: 'age',
          filter: {
            type: 'number', // #highlight
            operator: 'gt',
            value: 30
          }
        }
      ]}
      //#endregion
    />
  );
}

function IncludesOperatorIcon() {
  return <span>⊃</span>;
}

export const stringFilterType: DataSourceFilterType<Developer> = {
  label: 'Text',
  emptyValues: [''],
  defaultOperator: 'includes',
  //#region using-filter-types
  operators: [
    {
      name: 'includes',
      components: { Icon: IncludesOperatorIcon /* a React Component */ },
      label: 'Includes',
      fn: ({ currentValue, filterValue }) => {
        return (
          typeof currentValue === 'string' &&
          typeof filterValue == 'string' &&
          currentValue.toLowerCase().includes(filterValue.toLowerCase())
        );
      },
    },
    //...
  ]
  //#endregion
};

export function SalaryFilterType() {
  //#region salary-filter-type
  const filterTypes = {
    salary: {
      defaultOperator: 'gt',
      emptyValues: ['', null, undefined],
      operators: [ /*...*/ ]
    }
  };

  <DataSource<Developer>
    primaryKey="id"
    data={data}
    filterTypes={filterTypes}
  />
  //#endregion
  return null;
}

//#region customizing-default-filter-types
import { defaultFilterTypes } from '@infinite-table/infinite-react';
//#endregion

//#region using-a-filter-function-instead-of-the-column
import { defaultFilterFunction } from '@infinite-table/infinite-react';

// the built-in column filtering
<DataSource<Developer> primaryKey="id" data={data} filterFunction={defaultFilterFunction} />;

// your own logic only
<DataSource<Developer> primaryKey="id" data={data} filterFunction={(param) => param.data.id > 100} />;

// the column filters, and your own condition
<DataSource<Developer>
  primaryKey="id"
  data={data}
  filterFunction={(param) =>
    defaultFilterFunction(param) && param.data.id > 100
  }
/>;
//#endregion

export {};

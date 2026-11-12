// Snippets shown on filtering-client-side.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
} from '@infinite-table/infinite-react';

{
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
}

{
  //#region using-filter-types
  operators: [
    {
      name: 'includes',
      components: { Icon: /* a React Component */ },
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
}

{
  //#region using-filter-types-2
  const filterTypes = {
    salary: {
      defaultOperator: 'gt',
      emptyValues: ['', null, undefined],
      operators: [ /*...*/ ]
    }
  }

  <DataSource<Developer>
    filterTypes={filterTypes}
  />
  //#endregion
}

//#region customizing-default-filter-types
import { defaultFilterTypes } from '@infinite-table/infinite-react';
//#endregion

//#region using-a-filter-function-instead-of-the-column
import { defaultFilterFunction } from '@infinite-table/infinite-react';

// the built-in column filtering
<DataSource<Developer> filterFunction={defaultFilterFunction} />;

// your own logic only
<DataSource<Developer> filterFunction={(param) => param.data.id > 100} />;

// the column filters, and your own condition
<DataSource<Developer>
  filterFunction={(param) =>
    defaultFilterFunction(param) && param.data.id > 100
  }
/>;
//#endregion

export {};

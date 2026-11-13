// Code shown on the "Grouping rows" page, one `#region` per snippet.
// Type-checked with the rest of the docs against the current source.
import * as React from 'react';
import {
  DataSource,
  InfiniteTable,
  type DataSourcePropGroupBy,
  type DataSourcePropGroupRowsStateObject,
  type DataSourceRemoteData,
  type InfiniteTablePropColumns,
  type InfiniteTablePropGroupColumn,
} from '@infinite-table/infinite-react';

//#region intro
type Person = {
  name: string;
  age: number;
  country: string;
  id: string;
}

const groupBy: DataSourcePropGroupBy<Person> = [{field: 'country'}];

<DataSource<Person> primaryKey="id" data={data} groupBy={groupBy}>
  <InfiniteTable<Person> columns={columns} />
</DataSource>
//#endregion
;

declare const data: Person[];
declare const columns: InfiniteTablePropColumns<Person>;

type Developer = {
  id: number;
  firstName: string;
  companyName: string;
  country: string;
  city: string;
  stack: string;
  age: number;
  salary: number;
};

export function groupByColumn() {
  //#region group-by-column
  const groupBy: DataSourcePropGroupBy<Person> = [
    {
      field: 'country',
      column: { // #highlight
        // custom column configuration for group column
        defaultWidth: 150,
        header: 'Country group',
      },
    },
  ];
  //#endregion
  return groupBy;
}

export function groupByColumnRenderValue() {
  //#region group-by-column-render-value
  const groupBy: DataSourcePropGroupBy<Person> = [
    {
      field: 'country',
      column: {
        renderValue: ({ value }) => <>Country: {value}</>, // #highlight
      },
    },
  ];
  //#endregion
  return groupBy;
}

export function groupRowsState() {
  //#region specifying-the-default-state-for-group-rows
  const defaultGroupRowsState: DataSourcePropGroupRowsStateObject = {
    collapsedRows: true,
    expandedRows: [['Mexico'], ['Mexico', 'backend'], ['India']],
  };
  //#endregion
  return defaultGroupRowsState;
}

export function nestedGroupRowsState() {
  //#region controlling-the-collapse-expand-state
  const defaultGroupRowsState = {
    collapsedRows: true,
    expandedRows: [['Mexico', 'backend']],
  };
  //#endregion
  return defaultGroupRowsState;
}

export function multipleGroupColumns() {
  //#region multiple-groups-columns
  const groupBy: DataSourcePropGroupBy<Developer> = [
    {
      field: 'age',
      column: {
        defaultWidth: 100,
        renderValue: ({ value }) => <>Age: {value}</>,
      },
    },
    {
      field: 'companyName',
    },
    {
      field: 'country',
    },
  ];
  //#endregion
  return groupBy;
}

export function groupColumnBoundToField() {
  //#region binding-the-group-column-to-a-field
  const groupColumn = {
    id: 'the-group', // can specify an id
    style: {
      color: 'tomato',
    },
    field: 'firstName', // non-group rows will render the first name // #highlight
  };
  const columns = {
    theFirstName: {
      field: 'firstName',
      style: { // #highlight
        // this style will also be applied in the group column,
        // since it is bound to this same `field`
        fontWeight: 'bold',
      },
    },
  };
  //#endregion
  return { groupColumn, columns };
}

export function groupColumnRenderers() {
  //#region use-groupcolumn-to-customize-rendering
  const groupColumn: InfiniteTablePropGroupColumn<Developer> = {
    field: 'firstName',
    renderGroupValue: ({ value }) => { // #highlight
      return `Group: ${value}`;
    },
    renderLeafValue: ({ value }) => { // #highlight
      return `First name: ${value}`;
    },
  };
  //#endregion
  return groupColumn;
}

export function groupColumnSortInfo() {
  //#region sorting-the-group-column
  const sortInfo = [
    {
      dir: 1,
      id: 'group-by',
      field: ['stack', 'age'],
      type: ['string', 'number'],
    },
  ];
  //#endregion
  return sortInfo;
}

// The lazy loading examples below show a request and the response to it.
//
// The request lines are only an illustration of what the `data` function can
// send to the server (the format is up to the app): they are written as
// `name: value` lines, which TypeScript reads as labeled statements.
// The response is the object the `data` function has to resolve to, so it is
// checked against the `DataSourceRemoteData` type.
export function lazyLoadingResponses() {
  // the rows the server returns in these examples
  type Developer = {
    id: number;
    firstName: string;
    country: string;
    city: string;
    stack: string;
    age: number;
    salary: number;
  };

  function topLevelGroups() {
    //#region server-side-grouping-with-lazy-loading
    //request:
    groupKeys: [] // empty keys array, so it's a top-level group
    groupBy: [{"field":"country"},{"field":"city"}]
    reducers: [{"field":"salary","id":"avgSalary","name":"avg"},{"field":"age","id":"avgAge","name":"avg"}]
    // lazyLoadStartIndex: 0, - passed if lazyLoad is configured with a batchSize
    // lazyLoadBatchSize: 20 - passed if lazyLoad is configured with a batchSize

    //response
    const response: DataSourceRemoteData<Developer> = {
      cache: true,
      totalCount: 20,
      data: [
        {
          data: {country: "Argentina"},
          aggregations: {avgSalary: 20000, avgAge: 30},
          keys: ["Argentina"],
        },
        {
          data: {country: "Australia"},
          aggregations: {avgSalary: 25000, avgAge: 35},
          keys: ["Australia"],
        }
        //...
      ]
    }
    //#endregion
    return response;
  }

  function expandedGroup() {
    //#region lazy-loading-expanded-group

    //request:
    groupKeys: ["Argentina"]
    groupBy: [{"field":"country"},{"field":"city"}]
    reducers: [{"field":"salary","id":"avgSalary","name":"avg"},{"field":"age","id":"avgAge","name":"avg"}]

    //response
    const response: DataSourceRemoteData<Developer> = {
      totalCount: 4,
      data: [
        {
          data: {country: "Argentina", city: "Buenos Aires"},
          aggregations: {avgSalary: 20000, avgAge: 30},
          keys: ["Argentina", "Buenos Aires"],
        },
        {
          data: {country: "Argentina", city: "Cordoba"},
          aggregations: {avgSalary: 25000, avgAge: 35},
          keys: ["Argentina", "Cordoba"],
        },
        //...
      ]
    }
    //#endregion
    return response;
  }

  function leafRows() {
    //#region lazy-loading-leaf-rows

    //request
    groupKeys: ["Argentina","Buenos Aires"]
    groupBy: [{"field":"country"},{"field":"city"}]
    reducers: [{"field":"salary","id":"avgSalary","name":"avg"},{"field":"age","id":"avgAge","name":"avg"}]

    //response
    const response: DataSourceRemoteData<Developer> = {
      totalCount: 20,
      data: [
        {
          id: 34,
          country: "Argentina",
          city: "Buenos Aires",
          age: 30,
          salary: 20000,
          stack: "full-stack",
          firstName: "John",
          //...
        },
        {
          id: 35,
          country: "Argentina",
          city: "Buenos Aires",
          age: 35,
          salary: 25000,
          stack: "backend",
          firstName: "Jane",
          //...
        },
        //...
      ]
    }
    //#endregion
    return response;
  }

  function eagerlyLoadedGroups() {
    //#region eager-loading-for-group-row-nodes
    //request:
    groupKeys: [] // empty keys array, so it's a top-level group
    groupBy: [{"field":"country"},{"field":"city"}]
    reducers: [{"field":"salary","id":"avgSalary","name":"avg"},{"field":"age","id":"avgAge","name":"avg"}]
    // lazyLoadStartIndex: 0, - passed if lazyLoad is configured with a batchSize
    // lazyLoadBatchSize: 20 - passed if lazyLoad is configured with a batchSize

    //response
    const response: DataSourceRemoteData<Developer> = {
      cache: true,
      totalCount: 20,
      data: [
        {
          data: {country: "Argentina"},
          aggregations: {avgSalary: 20000, avgAge: 30},
          keys: ["Argentina"],
          // NOTE this dataset property used for eager-loading of group nodes
          dataset: { // #highlight
            // the shape of the dataset is the same as the one normally returned by the datasource
            cache: true,
            totalCount: 4,
            data: [
              {
                data: {country: "Argentina", city: "Buenos Aires"},
                aggregations: {avgSalary: 20000, avgAge: 30},
                keys: ["Argentina", "Buenos Aires"],
              },
              {
                data: {country: "Argentina", city: "Cordoba"},
                aggregations: {avgSalary: 25000, avgAge: 35},
                keys: ["Argentina", "Cordoba"],
              },
            ]
          }
        },
        {
          data: {country: "Australia"},
          aggregations: {avgSalary: 25000, avgAge: 35},
          keys: ["Australia"],
        }
        //...
      ]
    }
    //#endregion
    return response;
  }

  return [topLevelGroups, expandedGroup, leafRows, eagerlyLoadedGroups];
}

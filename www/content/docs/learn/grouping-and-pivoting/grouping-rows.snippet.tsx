// Snippets shown on grouping-rows.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  DataSourcePropGroupRowsStateObject,
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
  //#region intro
  type Person = {
    name: string;
    age: number;
    country: string;
    id: string;
  }

  const groupBy = [{field: 'country'}]

  <DataSource<Person> groupBy={groupBy}>
    <InfiniteTable<Person> />
  </DataSource>
  //#endregion
}

{
  //#region intro-2
  const groupBy = [
    {
      field: 'country',
      column: { // #highlight
        // custom column configuration for group column
        width: 150,
        header: 'Country group',
      },
    },
  ];
  //#endregion
}

{
  //#region intro-3
  const groupBy = [
    {
      field: 'country',
      column: {
        renderValue: ({ value }) => <>Country: {value}</>, // #highlight
      },
    },
  ];
  //#endregion
}

{
  //#region specifying-the-default-state-for-group-rows
  const defaultGroupRowsState: DataSourcePropGroupRowsStateObject = {
    collapsedRows: true,
    expandedRows: [['Mexico'], ['Mexico', 'backend'], ['India']],
  };
  //#endregion
}

{
  //#region controlling-the-collapse-expand-state
  const defaultGroupRowsState = {
    collapsedRows: true,
    expandedRows: [['Mexico', 'backend']],
  };
  //#endregion
}

{
  //#region multiple-groups-columns
  const groupBy = [
    {
      field: 'age',
      column: {
        width: 100,
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
}

{
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
}

{
  //#region use-groupcolumn-to-customize-rendering
  const groupColumn = {
    field: 'firstName',
    renderGroupValue: ({ value }) => { // #highlight
      return `Group: ${value}`;
    },
    renderLeafValue: ({ value }) => { // #highlight
      return `First name: ${value}`;
    },
  };
  //#endregion
}

{
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
}

{
  //#region server-side-grouping-with-lazy-loading
  //request:
  groupKeys: [] // empty keys array, so it's a top-level group
  groupBy: [{"field":"country"},{"field":"city"}]
  reducers: [{"field":"salary","id":"avgSalary","name":"avg"},{"field":"age","id":"avgAge","name":"avg"}]
  // lazyLoadStartIndex: 0, - passed if lazyLoad is configured with a batchSize
  // lazyLoadBatchSize: 20 - passed if lazyLoad is configured with a batchSize

  //response
  {
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
}

{
  //#region server-side-grouping-with-lazy-loading-2

  //request:
  groupKeys: ["Argentina"]
  groupBy: [{"field":"country"},{"field":"city"}]
  reducers: [{"field":"salary","id":"avgSalary","name":"avg"},{"field":"age","id":"avgAge","name":"avg"}]

  //response
  {
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
}

{
  //#region server-side-grouping-with-lazy-loading-3

  //request
  groupKeys: ["Argentina","Buenos Aires"]
  groupBy: [{"field":"country"},{"field":"city"}]
  reducers: [{"field":"salary","id":"avgSalary","name":"avg"},{"field":"age","id":"avgAge","name":"avg"}]

  //response
  {
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
}

{
  //#region eager-loading-for-group-row-nodes
  //request:
  groupKeys: [] // empty keys array, so it's a top-level group
  groupBy: [{"field":"country"},{"field":"city"}]
  reducers: [{"field":"salary","id":"avgSalary","name":"avg"},{"field":"age","id":"avgAge","name":"avg"}]
  // lazyLoadStartIndex: 0, - passed if lazyLoad is configured with a batchSize
  // lazyLoadBatchSize: 20 - passed if lazyLoad is configured with a batchSize

  //response
  {
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
}

export {};

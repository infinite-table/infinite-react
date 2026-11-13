// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  type DataSourceAggregationReducer,
  type DataSourcePropAggregationReducers,
  type DataSourcePropFilterTypes,
  DataSourcePropGroupRowsStateObject,
  type DataSourcePropRowSelection_MultiRow,
  type DataSourcePropSortTypes,
  type DataSourceSingleSortInfo,
  type InfiniteTableColumnAggregator,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  name: string;
  age: number;
  salary: number;
  license: string;
  preferredLanguage: string;
  color: string;
};

declare const data: Developer[];

export function nodePaths() {
  //#region node-path-vs-row-id
  const data = [
    { id: '1', name: 'Documents',                // path: ['1'] // #highlight
      children: [
        { id: '10', name: 'Private',             // path: ['1', '10']
          children: [
            { id: '100', name: 'Report.docx' },  // path: ['1', '10', '100']
            { id: '101', name: 'Vacation.docx' },// path: ['1', '10', '101']
          ],
        },
      ]
    },
    {
      id: '2',
      name: 'Downloads',                        // path: ['2']
      children: [
        {
          id: '20',
          name: 'cat.jpg',                      // path: ['2', '20']
        },
      ],
    },
  ];
  //#endregion
  return data;
}

//#region onrowdisabledstatechange
import {
  DataSource,
  RowDisabledStateObject, // #highlight
} from '@infinite-table/infinite-react';
function App() {
  const [rowDisabledState, setRowDisabledState] = React.useState<
    RowDisabledStateObject<number>
  >({
    enabledRows: true,
    disabledRows: [1, 3, 4, 5],
  });
  return (
    <>
      <DataSource<Developer>
        data={data}
        primaryKey="id"
        rowDisabledState={rowDisabledState}
        onRowDisabledStateChange={(rowState) => {
          setRowDisabledState(rowState.getState()); // #highlight
        }}
      />
    </>
  );
}
//#endregion

export function pivotColumnOfAnAggregation() {
  //#region aggregationreducers-pivotcolumn
  const aggregationReducers: DataSourcePropAggregationReducers<Developer> = {
    salary: {
      field: 'salary',
      initialValue: 0,
      reducer: (acc, sum) => acc + sum,
      pivotColumn: {
        defaultSortable: true,
      },
    },
    license: {
      field: 'license',
      initialValue: 0,
      reducer: (acc) => acc + 1,
    },
  };
  //#endregion
  return aggregationReducers;
}

export function pivotColumnInheritFromColumn() {
  const avgReducer: InfiniteTableColumnAggregator<Developer, number> = {
    initialValue: 0,
    reducer: (acc, sum) => acc + sum,
    done: (sum, arr) => (arr.length ? sum / arr.length : 0),
  };
  //#region aggregationreducers-pivotcolumn-inheritfromcolumn
  const aggregationReducers = {
    avgSalary: { field: 'salary', ...avgReducer },
    avgAge: {
      field: 'age',
      ...avgReducer,
      pivotColumn: {
        inheritFromColumn: 'preferredLanguage',
        defaultWidth: 500,
      },
    },
  };
  //#endregion
  // declared without a type on the page, so check the `pivotColumn` here
  const checked: DataSourceAggregationReducer<Developer, number>['pivotColumn'] =
    aggregationReducers.avgAge.pivotColumn;
  return checked;
}

// shown for both `defaultRowSelection` and `rowSelection`
export function rowSelectionValues() {
  let rowSelection: DataSourcePropRowSelection_MultiRow;
  //#region rowselection
  rowSelection = {
    selectedRows: [3, 6, 100, 23], // those specific rows are selected
    defaultSelection: false, // all rows deselected by default
  };

  // or
  rowSelection = {
    deselectedRows: [3, 6, 100, 23], // those specific rows are deselected
    defaultSelection: true, // all other rows are selected
  };

  // or, for grouped data - this example assumes groupBy=continent,country,city
  rowSelection = {
    selectedRows: [
      45, // row with id 45 is selected, no matter the group
      ['Europe', 'France'], // all rows in Europe/France are selected
      ['Asia'], // all rows in Asia are selected
    ],
    deselectedRows: [
      ['Europe', 'France', 'Paris'], // all rows in Paris are deselected
    ],
    defaultSelection: false, // all other rows are selected
  };
  //#endregion
  return rowSelection;
}

export function lazyLoadRowSelection() {
  //#region rowselection-lazyload
  // this example assumes groupBy=continent,country,city
  const rowSelection = {
    selectedRows: [
      // row with id 45 is selected - we need this because in the lazyLoad scenario,
      // not all parents might have been made available yet
      ['Europe','Italy', 'Rome', 45], // #highlight
      ['Europe','France'], // all rows in Europe/France are selected
      ['Asia'] // all rows in Asia are selected
    ],
    deselectedRows: [
      ['Europe','Italy','Rome'] // all rows in Rome are deselected
      // but note that row with id 45 is selected, so Rome will be rendered with an indeterminate selection state
    ],
    defaultSelection: false // all other rows are selected
  }
  //#endregion
  // declared without a type on the page, so check it here
  const checked: DataSourcePropRowSelection_MultiRow = rowSelection;
  return checked;
}

export function CustomSortType() {
  const colorOrder = ['magenta', 'blue', 'green'];
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={data}
      //#region defaultsortinfo
      defaultSortInfo={{
        field: 'color',
        dir: 1,
        // note this custom sort type
        type: 'color',
      }}
      //#endregion
      //#region defaultsortinfo-sorttypes
      sortTypes={{
        color: (a, b) => colorOrder.indexOf(a) - colorOrder.indexOf(b),
      }}
      //#endregion
    />
  );
}

export function incomeFilterType() {
  //#region filtertypes
  const filterTypes: DataSourcePropFilterTypes<Developer> = {
    income: {
      label: 'Income',
      emptyValues: ['', null, undefined],
      defaultOperator: 'gt',
      operators: [
        {
          name: 'gt',
          label: 'Greater than',
          fn: ({ currentValue, filterValue }) => {
            return currentValue > filterValue;
          },
        },
        {
          name: 'gte',
          fn: ({ currentValue, filterValue }) => currentValue >= filterValue,
          //...
        },
        {
          name: 'lt',
          fn: ({ currentValue, filterValue }) => currentValue < filterValue,
          //...
        },
        {
          name: 'lte',
          fn: ({ currentValue, filterValue }) => currentValue <= filterValue,
          //...
        },
      ],
    },
  };
  //#endregion
  return filterTypes;
}

//#region filtertypes-import
import { defaultFilterTypes } from '@infinite-table/infinite-react';
//#endregion

export function groupRowsStates() {
  //#region specifying-the-state-for-group-rows
  const groupRowsState: DataSourcePropGroupRowsStateObject = {
    collapsedRows: true,
    expandedRows: [['Mexico'], ['Mexico', 'backend'], ['India']],
  };
  //#endregion

  //#region specifying-the-initial-state-for-group-rows
  const defaultGroupRowsState: DataSourcePropGroupRowsStateObject = {
    expandedRows: true,
    collapsedRows: [['Mexico'], ['Mexico', 'backend'], ['India']],
  };
  //#endregion
  return [groupRowsState, defaultGroupRowsState];
}

//#region sortfunction
import { multisort } from '@infinite-table/infinite-react';

const arr: Developer[] = [
  /*...*/
];
const sortInfo: DataSourceSingleSortInfo<Developer>[] = [
  {
    field: 'age',
    dir: -1,
  },
  {
    field: 'name',
    dir: 1,
  },
];
multisort(sortInfo, arr);
//#endregion

export function defaultSortTypes() {
  //#region sorttypes
  // default implementation
  const sortTypes: DataSourcePropSortTypes = {
    string: (a, b) => a.localeCompare(b),
    number: (a, b) => a - b,
    date: (a, b) => a - b,
  };
  //#endregion
  return sortTypes;
}

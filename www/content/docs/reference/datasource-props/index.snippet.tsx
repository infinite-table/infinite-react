// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSourcePropGroupRowsStateObject,
} from '@infinite-table/infinite-react';

{
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

{
  //#region aggregationreducers-pivotcolumn
  const aggregationReducers = {
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
}

{
  //#region aggregationreducers-pivotcolumn-2
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
}

{
  //#region defaultrowselection
  const rowSelection = {
    selectedRows: [3, 6, 100, 23], // those specific rows are selected
    defaultSelection: false, // all rows deselected by default
  };

  // or
  const rowSelection = {
    deselectedRows: [3, 6, 100, 23], // those specific rows are deselected
    defaultSelection: true, // all other rows are selected
  };

  // or, for grouped data - this example assumes groupBy=continent,country,city
  const rowSelection = {
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
}

{
  //#region defaultsortinfo
  defaultSortInfo={{
    field: 'color',
    dir: 1,
    // note this custom sort type
    type: 'color',
  }}
  //#endregion
}

{
  //#region defaultsortinfo-2
  sortTypes={{
    color: (a, b) => //...
  }}
  //#endregion
}

//#region treefilterfunction
import {
  defaultFilterFunction,
  defaultTreeFilterFunction,
} from '@infinite-table/infinite-react';

// the built-in tree filtering: leaf nodes are matched against the column filters,
// a parent node is kept when at least one of its descendants is kept
treeFilterFunction={defaultTreeFilterFunction}

// also keep the parent nodes that match the column filters themselves
treeFilterFunction={(param) =>
  param.isLeafNode
    ? defaultFilterFunction(param)
    : defaultFilterFunction(param) || param.filterTreeNode(param.data)
}
//#endregion

{
  //#region filtertypes
  const filterTypes = {
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
          //...
        },
        {
          name: 'lt',
          //...
        },
        {
          name: 'lte',
          //...
        },
      ],
    },
  };
  //#endregion
}

//#region filtertypes-2
import { defaultFilterTypes } from '@infinite-table/infinite-react';
//#endregion

{
  //#region specifying-the-state-for-group-rows
  const groupRowsState: DataSourcePropGroupRowsStateObject = {
    collapsedRows: true,
    expandedRows: [['Mexico'], ['Mexico', 'backend'], ['India']],
  };
  //#endregion
}

{
  //#region specifying-the-initial-state-for-group-rows
  const defaultGroupRowsState: DataSourcePropGroupRowsStateObject = {
    expandedRows: true,
    collapsedRows: [['Mexico'], ['Mexico', 'backend'], ['India']],
  };
  //#endregion
}

{
  //#region rowselection
  const rowSelection = {
    selectedRows: [3, 6, 100, 23], // those specific rows are selected
    defaultSelection: false, // all rows deselected by default
  };

  // or
  const rowSelection = {
    deselectedRows: [3, 6, 100, 23], // those specific rows are deselected
    defaultSelection: true, // all other rows are selected
  };

  // or, for grouped data - this example assumes groupBy=continent,country,city
  const rowSelection = {
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
}

{
  //#region rowselection-2
  // this example assumes groupBy=continent,country,city
  const rowSelection = {
    selectedRows: [
      // row with id 45 is selected - we need this because in the lazyLoad scenario,
      // not all parents might have been made available yet
      ['Europe','Italy', 'Rome', 45], // #highlight
      ['Europe','France'], // all rows in Europe/France are selected
      ['Asia'] // all rows in Asia are selected
    ]
    deselectedRows: [
      ['Europe','Italy','Rome'] // all rows in Rome are deselected
      // but note that row with id 45 is selected, so Rome will be rendered with an indeterminate selection state
    ],
    defaultSelection: false // all other rows are selected
  }
  //#endregion
}

//#region sortfunction
import { multisort } from '@infinite-table/infinite-react';

const arr: Developer[] = [
  /*...*/
];
const sortInfo = [
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

{
  //#region sorttypes
  // default implementation
  const sortTypes = {
    string: (a, b) => a.localeCompare(b),
    number: (a, b) => a - b,
    date: (a, b) => a - b,
  };
  //#endregion
}

export {};

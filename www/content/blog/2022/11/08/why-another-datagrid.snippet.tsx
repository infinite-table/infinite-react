// Snippets shown on why-another-datagrid.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import { useState } from 'react';
import {
  DataSource,
  InfiniteTable,
  InfiniteTablePropColumns,
  type InfiniteTableProps,
} from '@infinite-table/infinite-react';

// ---------------------------------------------------------------------------
// The post quotes YUI 3 code, to compare the APIs. YUI is not installed, so this
// declares just the parts of it the quoted code uses.
// (The ExtJS 3 quote is in why-another-datagrid.extjs.snippet.tsx.)

declare namespace Y {
  type Plugin = { readonly NS: string };

  class DataTable {
    constructor(config: {
      columns: (
        | string
        | { key: string; width?: string; formatter?: string; sortable?: boolean }
      )[];
      data?: object[];
      sortable?: boolean;
      summary?: string;
    });
    render(selector: string): this;
    sort(fields: Record<string, 'asc' | 'desc'>): this;
    plug(plugin: Plugin, config: object): this;
  }

  namespace DataSource {
    class IO {
      constructor(config: { source: string });
      plug(plugin: Plugin, config: object): this;
    }
  }

  namespace Plugin {
    const DataSourceXMLSchema: Plugin;
    const DataTableDataSource: Plugin;
  }
}

export function yuiDataTableWithSorting(data: object[]) {
  //#region yui-datatable-with-sorting
  var table = new Y.DataTable({
    columns: [
      { key: 'item', width: '125px' },
      {
        key: 'cost',
        formatter: '£: {value}', // #highlight
        sortable: true,
      },
    ],
    sortable: true,
    data: data,
  }).render('#example');

  // to programatically sort
  table.sort({ cost: 'asc' });
  //#endregion
}

export function yuiDataTableWithDataSource() {
  //#region yui-datatable
  var dataSource = new Y.DataSource.IO({
    source: '/restaurants/fetch.php?',
  });

  dataSource.plug(Y.Plugin.DataSourceXMLSchema, {
    schema: {
      resultListLocator: 'Result',
      resultFields: [{ key: 'Title' }, { key: 'Phone' }, { key: 'Rating' }],
    },
  });
  var table = new Y.DataTable({
    columns: ['Title', 'Phone', 'Rating'],
    summary: 'Chinese restaurants near 98089',
  });

  table.plug(Y.Plugin.DataTableDataSource, {
    datasource: dataSource,
    initialRequest: 'zip=94089&query=chinese',
  });
  //#endregion
}

// ---------------------------------------------------------------------------
// Infinite Table

type DataEntity = {
  id: number;
  firstName: string;
};
type DataType = {
  id: number;
  firstName: string;
  address: string;
  age: number;
};

export function DataSourceAndInfiniteTable(props: {
  data: DataEntity[];
  columns: InfiniteTablePropColumns<DataEntity>;
}) {
  const { data, columns } = props;
  return (
    //#region datasource-and-infinitetable
    <DataSource<DataEntity> primaryKey="id" data={data}>
      {/* if you wanted to, you can replace
       <InfiniteTable/> with your own custom component */}

      <InfiniteTable<DataEntity> columns={columns} />
    </DataSource>
    //#endregion
  );
}

export function declarativeColumnUpdates(data: DataType[]) {
  //#region fully-declarative-way-to-update-columns
  function getColumns() {
    return {
      firstName: {
        field: 'firstName',
        defaultWidth: 200,
        columnGroup: 'personalInfo',
      },
      address: {
        field: 'address',
        defaultWidth: 200,
        columnGroup: 'personalInfo',
      },
      age: {
        field: 'age',
        columnGroup: 'about'
      }
    } as InfiniteTablePropColumns<DataType>
  }

  const columnGroups = {
    personalInfo: { header: "Personal info" },
    about: { header: "About" }
  };

  function App() {
    const [columns, setColumns] = useState<InfiniteTablePropColumns<DataType>>(getColumns)
    const [colGroupForAddress, setColGroupForAddress] = useState('personalInfo')

    const toggle = () => {
      const cols = getColumns()

      const newColGroup = colGroupForAddress === 'personalInfo' ? 'about' : 'personalInfo'
      cols.address.columnGroup = newColGroup

      setColumns(cols) // #highlight
      setColGroupForAddress(newColGroup)
    }
    const btn = <button onClick={toggle}> Toggle group for address </button>

    return <>
      {btn}
      <DataSource<DataType> data={data} primaryKey="id">
        <InfiniteTable columns={columns} columnGroups={columnGroups}/>
      </DataSource>
    </>
  }
  //#endregion
  return App;
}

// The two `groupColumn` snippets show only that prop (`//...` stands for the others):
// the library component with every prop optional, so the code stays as it was published.
const AbbreviatedInfiniteTable = InfiniteTable as <T>(
  props: Partial<InfiniteTableProps<T>>,
) => React.JSX.Element;

export function GroupColumnAsAnObject() {
  const InfiniteTable = AbbreviatedInfiniteTable;
  return (
    //#region group-column-as-an-object
    <InfiniteTable
      //...
      groupColumn={{
        header: 'Groups',
      }}
    />
    //#endregion
  );
}

export function GroupColumnAsAFunction() {
  const InfiniteTable = AbbreviatedInfiniteTable;
  return (
    //#region group-column-as-a-function
    <InfiniteTable
      //...
      groupColumn={() => {
        // this allows you to affect all generated group columns in a single place
        // especially useful when the generated columns are dynamic or generated via a pivot
        return {/* ... */}
      }}
    />
    //#endregion
  );
}

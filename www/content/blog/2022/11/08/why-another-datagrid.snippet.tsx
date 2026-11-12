// Snippets shown on why-another-datagrid.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import { useState } from 'react';
import {
  DataSource,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

{
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

{
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

{
  //#region yui-datatable-2
  <DataSource<DataEntity> primaryKey="id" data={...}>
    {/* if you wanted to, you can replace
     <InfiniteTable/> with your own custom component */}

    <InfiniteTable<DataEntity> columns={...}>
  </DataSource>
  //#endregion
}

{
  //#region extjs-3-datagrid-code-snippet
  var grid = new Ext.grid.GridPanel({
    // data fetching abstracted in a "Store" component
    store: new Ext.data.Store({
      // ...
    }),
    // columns abstracted in a ColumnModel
    colModel: new Ext.grid.ColumnModel({
      defaults: {
        width: 120,
        sortable: true,
      },
      columns: [
        {
          id: 'company',
          header: 'Company',
          width: 200,
          sortable: true,
          dataIndex: 'company',
        },
        {
          header: 'Price',
          renderer: Ext.util.Format.usMoney,
          dataIndex: 'price',
        },
        { header: 'Change', dataIndex: 'change' },
        { header: '% Change', dataIndex: 'pctChange' },
        {
          header: 'Last Updated',
          width: 135,
          dataIndex: 'lastChange',
          xtype: 'datecolumn',
          format: 'M d, Y',
        },
      ],
    }),
    viewConfig: {
      forceFit: true,
      // Return CSS class to apply to rows depending upon data values
      getRowClass: function (record, index) {
        var c = record.get('change');
        if (c < 0) {
          return 'price-fall';
        } else if (c > 0) {
          return 'price-rise';
        }
      },
    },
    sm: new Ext.grid.RowSelectionModel({ singleSelect: true }),
    // size need if not inside a layout
    width: 600,
    height: 300,
  });
  //#endregion
}

{
  //#region fully-declarative-way-to-update-columns
  function getColumns() {
    return {
      firstName: {
        field: 'firstName',
        width: 200,
        columnGroup: 'personalInfo',
      },
      address: {
        field: 'address',
        width: 200,
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
    }}
    const btn = <button onClick={toggle}> Toggle group for address </button>

    return <>
      {btn}
      <DataSource<DataType> data={...} primaryKey="id">
        <InfiniteTable columns={columns} columnGroups={columnGroups}/>
      </DataSource>
    </>
  }
  //#endregion
}

{
  //#region group-column-as-an-object
  <InfiniteTable
    //...
    groupColumn={{
      header: 'Groups',
    }}
  />
  //#endregion
}

{
  //#region group-column-as-a-function
  <InfiniteTable
    //...
    groupColumn={() => {
      // this allows you to affect all generated group columns in a single place
      // especially useful when the generated columns are dynamic or generated via a pivot
      return {...}
    }}
  />
  //#endregion
}

export {};

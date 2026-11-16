// @ts-nocheck
// The ExtJS 3 code quoted on why-another-datagrid.page.md.
//
// Parsed, but not type-checked: it is JavaScript quoted from the ExtJS 3 docs
// (the library is not installed), and its `getRowClass` returns a value on some
// paths only - valid JavaScript that `noImplicitReturns` rejects. The quote
// stays as it was written rather than being rewritten to pass.

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

export {};

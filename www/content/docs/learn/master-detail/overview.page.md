---
title: Master Detail
description: Learn how to use master-detail rendering with the React DataGrid
---

The React DataGrid that Infinite Table offers has native support for master-detail rows.

<Note>

The single most important property for the master-detail DataGrid configuration is the <PropLink name="rowDetailRenderer" /> function prop - which makes the DataGrid be considered master-detail.

In addition, make sure you have a column with the `renderRowDetailIcon: true` flag set. <PropLink name="columns.renderRowDetailIcon" /> on a column makes the column display the row detail expand icon.

The row detail in the DataGrid can contain another DataGrid or any other custom content.
</Note>

<Note>

It's very imporant that the <PropLink name="rowDetailRenderer" /> function prop you pass into `<InfiniteTable />` is stable and doesn't change on every render. So make sure you pass a reference to the same function every time - except of course if you want the row detail to change based on some other state.
</Note>

<Sandpack title="Basic master detail DataGrid example" size="lg">

<Description>

This example shows a master DataGrid with cities & countries.

The details for each city shows a DataGrid with developers in that city.

The detail DataGrid is configured with remote sorting.

</Description>

```ts file="master-detail-example.page.tsx"

```

</Sandpack>

## Loading the Detail DataSource

When master-detail is configured and the row detail renders a DataGrid, the <DPropLink name="data" /> function for the detail `<DataSource />` will be called with the `masterRowInfo` as a property available in the object passed as argument.

```tsx title="Loading the detail DataGrid data" {2}
const detailDataFn: DataSourceData<Developer> = ({
  masterRowInfo,
  sortInfo,
  ...
}) => {

  return Promise.resolve([...])
}

<DataSource<Developer> data={detailDataFn}>
  {...}
</DataSource>
```

You can see the live example above for more details.

## Rendering a detail DataGrid

Using the <PropLink name="rowDetailRenderer" /> prop, you can render any custom content for the row details.

The content doesn't need to include Infinite Table.

You can, however, render an Infinite Table React DataGrid, at any level of nesting inside the row detail content.

<Sandpack title="Master detail with custom content & DataGrid" size="lg" viewMode="preview">

<Description>

In this example, the row detail contains custom content, along with another Infinite Table DataGrid. You can nest a child DataGrid inside the row details at any level of nesting.

</Description>

```ts file="master-detail-custom-datagrid-example.page.tsx"

```

</Sandpack>

## Configuring the master-detail height

In order to configure the height of the row details, you can use the <PropLink name="rowDetailHeight" /> prop.

```tsx title="Configuring the row detail height" {3}
<InfiniteTable<City>
  columns={masterColumns}
  rowDetailHeight={500}
  rowDetailRenderer={renderDetail}
/>
```

The default value for the <PropLink name="rowDetailHeight" /> is `300` px.

<PropLink name="rowDetailHeight" /> can be one of the following:

- `number` - the height in pixels
- `string` - the name of a CSS variable that configures the height - eg: `--master-detail-height`
- `(rowInfo) => number` - a function that can return a different height for each row. The sole argument is the <TypeLink name="InfiniteTableRowInfo">rowInfo object</TypeLink>.

<Sandpack title="Master detail DataGrid with custom height for row details" size="lg">

<Description>

This master-detail DataGrid is configured with a custom <PropLink name="rowDetailHeight" /> of `200px`.

</Description>

```ts file="master-detail-custom-detail-height-example.page.tsx"

```

</Sandpack>

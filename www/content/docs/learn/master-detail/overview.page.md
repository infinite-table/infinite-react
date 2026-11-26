---
title: Master Detail
description: Learn how to use master-detail rendering with the React DataGrid
vue:
  description: Learn how to use master-detail rendering with the Vue DataGrid
angular:
  description: Learn how to use master-detail rendering with the Angular DataGrid
---

<FrameworkContent framework="react">

The React DataGrid that Infinite Table offers has native support for master-detail rows.

</FrameworkContent>

<FrameworkContent framework="vue">

The Vue DataGrid that Infinite Table offers has native support for master-detail rows.

</FrameworkContent>

<FrameworkContent framework="angular">

The Angular DataGrid that Infinite Table offers has native support for master-detail rows.

</FrameworkContent>

<Note>

The single most important property for the master-detail DataGrid configuration is the <PropLink name="rowDetailRenderer" /> function prop - which makes the DataGrid be considered master-detail.

In addition, make sure you have a column with the `renderRowDetailIcon: true` flag set. <PropLink name="columns.renderRowDetailIcon" /> on a column makes the column display the row detail expand icon.

The row detail in the DataGrid can contain another DataGrid or any other custom content.
</Note>

<FrameworkContent not="angular">

<Note>

It's very imporant that the <PropLink name="rowDetailRenderer" /> function prop you pass into `<InfiniteTable />` is stable and doesn't change on every render. So make sure you pass a reference to the same function every time - except of course if you want the row detail to change based on some other state.
</Note>

</FrameworkContent>

<FrameworkContent framework="angular">

<Note>

It's very imporant that the <PropLink name="rowDetailRenderer" /> function you pass into `<infinite-table>` is stable. Make it a field of your component (an arrow function), not a method called in the template, so the grid gets a reference to the same function every time - except of course if you want the row detail to change based on some other state.

</Note>

<Note>

The <PropLink name="rowDetailRenderer" /> function returns the content of the row detail: usually an `ng-template` of your component (a `TemplateRef`, read with `viewChild`), which gets the master row as its context (`let-rowInfo`). For a detail DataGrid, the template holds an `<infinite-data-source>` with an `<infinite-table>` inside.

</Note>

</FrameworkContent>

<FrameworkContent framework="vue">

<Note>

The <PropLink name="rowDetailRenderer" /> function returns the content of the row detail as VNodes created with `h()` - for a detail DataGrid, that is `h(DataSource, { ... }, () => h(InfiniteTable, { ... }))`. Define the function in `<script setup>`, not inline in the template, so the same function is passed on every render.

</Note>

</FrameworkContent>

<DemoDescription>

This example shows a master DataGrid with cities & countries.

The details for each city shows a DataGrid with developers in that city.

The detail DataGrid is configured with remote sorting.

</DemoDescription>

```tsx file="master-detail-example.demo.tsx" height="large" title="Basic master detail DataGrid example"
```


<FrameworkContent framework="react">

If you want to use a component instead of the <PropLink name="rowDetailRenderer" /> function, you can use the <PropLink name="components.RowDetail" /> property. This works similarly and makes the DataGrid be considered master-detail. Inside the component, you can use the <HookLink name="useMasterRowInfo" /> hook to get the master row information.

</FrameworkContent>

<FrameworkContent framework="vue">

If you want to use a component instead of the <PropLink name="rowDetailRenderer" /> function, you can use the <PropLink name="components.RowDetail" /> property. This works similarly and makes the DataGrid be considered master-detail. Inside the component, call the `useGetMasterDetailContextForVue` composable in `setup` - it returns a getter function, and `getter()?.masterRowInfo` is the master row information.

</FrameworkContent>

<FrameworkContent framework="angular">

If you want to use a component instead of the <PropLink name="rowDetailRenderer" /> function, you can use the <PropLink name="components.RowDetail" /> property. This works similarly and makes the DataGrid be considered master-detail. Inside the component, <HookLink name="useMasterRowInfo" /> gives you the master row information, as a signal.

</FrameworkContent>



## Loading the Detail DataSource

When master-detail is configured and the row detail renders a DataGrid, the <DPropLink name="data" /> function for the detail `<DataSource />` will be called with the `masterRowInfo` as a property available in the object passed as argument.

```tsx file="overview.snippet.tsx" region="loading-the-detail-datagrid-data" title="Loading the detail DataGrid data"
```

You can see the live example above for more details.

## Rendering a detail DataGrid

Using the <PropLink name="rowDetailRenderer" /> prop, you can render any custom content for the row details.

The content doesn't need to include Infinite Table.

<FrameworkContent framework="react">

You can, however, render an Infinite Table React DataGrid, at any level of nesting inside the row detail content.

</FrameworkContent>

<FrameworkContent framework="vue">

You can, however, render an Infinite Table Vue DataGrid, at any level of nesting inside the row detail content.

</FrameworkContent>

<FrameworkContent framework="angular">

You can, however, render an Infinite Table Angular DataGrid, at any level of nesting inside the row detail content.

</FrameworkContent>

<DemoDescription>

In this example, the row detail contains custom content, along with another Infinite Table DataGrid. You can nest a child DataGrid inside the row details at any level of nesting.

</DemoDescription>

```tsx file="master-detail-custom-datagrid-example.demo.tsx" height="large" title="Master detail with custom content & DataGrid"
```

## Configuring the master-detail height

In order to configure the height of the row details, you can use the <PropLink name="rowDetailHeight" /> prop.

```tsx file="overview.snippet.tsx" region="configuring-the-row-detail-height" title="Configuring the row detail height"
```

The default value for the <PropLink name="rowDetailHeight" /> is `300` px.

<PropLink name="rowDetailHeight" /> can be one of the following:

- `number` - the height in pixels
- `string` - the name of a CSS variable that configures the height - eg: `--master-detail-height`
- `(rowInfo) => number` - a function that can return a different height for each row. The sole argument is the <TypeLink name="InfiniteTableRowInfo">rowInfo object</TypeLink>.

<DemoDescription>

This master-detail DataGrid is configured with a custom <PropLink name="rowDetailHeight" /> of `200px`.

</DemoDescription>

```tsx file="master-detail-custom-detail-height-example.demo.tsx" height="large" title="Master detail DataGrid with custom height for row details"
```


## Conditional row details

Not all rows in a DataGrid need to have details. To configure which rows have details, you can use the <PropLink name="isRowDetailEnabled" /> function prop.

```tsx file="overview.snippet.tsx" region="using-conditional-row-details" title="Using conditional row details"
```

The <PropLink name="isRowDetailEnabled" /> function prop is called with the <TypeLink name="InfiniteTableRowInfo">rowInfo object</TypeLink> and is expected to return a boolean value.


<DemoDescription>

This example shows a master DataGrid with cities & countries.

Not all rows have details - every other row is configured without details via the <PropLink name="isRowDetailEnabled" /> function prop.

</DemoDescription>

```tsx file="master-detail-per-row-example.demo.tsx" height="large" title="Master detail DataGrid with conditional details"
```

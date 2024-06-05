---
title: Master Detail with Custom Row Detail Contents
description: Learn how to use master-detail to customise your row detail contents
---

The Infinite Table React DataGrid allows you to render any valid JSX nodes as row details.

You can render a DataGrid directly or you can nest the DataGrid at any level of nesting inside the row details.
Or you can simply choose to render anything else - no DataGrid required.

## Rendering a detail DataGrid

Your row detail content can include another Infinite Table DataGrid.

<Note>

The DataGrid you're rendering inside the row detail doesn't need to be the return value of the <PropLink name="rowDetailRenderer" /> function - it can be nested inside other valid JSX nodes you return from the function.

</Note>

<Sandpack title="Master detail with custom content & DataGrid" size="lg" viewMode="preview">

<Description>

In this example, the row detail contains custom content, along with another Infinite Table DataGrid. You can nest a child DataGrid inside the row details at any level of nesting.

</Description>

```ts file="master-detail-custom-datagrid-example.page.tsx"

```

</Sandpack>

<Note>

You'll probably want to configure the height of the row detail content. Use the <PropLink name="rowDetailHeight" /> prop to do that.

</Note>

## Rendering a chart component as row detail


<Sandpack title="Retrieving cell selection value by mapping over them" size="lg" deps="ag-charts-react,ag-charts-community">

```ts file=master-detail-chart-detail-example.page.tsx"

```

</Sandpack>

<Note>

In the above example, please note that on every render (after the detail component is mounted), we pass the same `dataSource`, `groupBy` and `aggregationReducers` props to the `<DataSource />` component. The references for all those objects are stable. We don't want to pass new references on every render, as that would cause the `<DataSource />` to reload and reprocess the data.

</Note>


## Multiple levels of nesting

The master-detail configuration for the DataGrid can contain any level of nesting.

The example below shows 3 levels of nesting - so a master DataGrid, a detail DataGrid and another third-level detail with custom content.

<Sandpack title="Master detail with 3 levels of nesting" size="lg" viewMode="preview">

<Description>

In this example, we have 3 levels of nesting:

- The master DataGrid shows cities/countries
- The first level of detail shows developers in each city
- The second level of detail shows custom data about each developer

</Description>

```ts file="master-detail-3-levels-example.page.tsx"

```

</Sandpack>

## Understanding the lifecycle of the row detail component

You have to keep in mind that the content you render in the row detail can be mounted and unmounted multiple times. Whenever the user expands the row detail, it gets mounted and rendered, but then it will be unmounted when the user scrolls the content out of view. This can happen very often.

Also note that the content can be recycled - meaning the same component can be reused for different rows. If you don't want recycling to happen, make sure you use a unique key for the row detail content - you can use the `masterRowInfo.id` for that.

<Note>

In practice this means that it's best if your row detail content is using controlled state and avoids using local state.

</Note>

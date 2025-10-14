---
title: Customizing your DataGrid component with Tailwind CSS
description: Find out how to customize your DataGrid component to fit your app needs, using Tailwind CSS
date: 2025-10-09
author: radu
draft: true
tags: theming, customizing
thumbnail: ./customizing-your-datagrid-component.png
---

We haven't spoken about this very much, but Infinite Table does offer you very powerful ways to customize the structure of your component. After all, we're a React-first DataGrid, so the component and composition patterns it offers should feel at home in a React app.


```tsx title="Default structure of InfiniteTable"
<DataSource>
  <InfiniteTable />
</DataSource>
```

## Customizing the nesting of the InfiniteTable component

However, be aware that you the `<InfiniteTable />` component doesn't have to be a direct child of the `<DataSource />` component. The `<DataSource />` component doesn't actually render anything, but its job is to load, process and prepare the data in a way that `<InfiniteTable />` understands and can display. And actually you can use the DataSource context to gain access to the data yourself.

```tsx {4} title="InfiniteTable can be nested anywhere inside the <DataSource /> component"
<DataSource>
  <h1>Your DataGrid</h1>
  <App>
    <InfiniteTable />
  </App>
</DataSource>
```


<Note>

Inside the `<DataSource />` component you can use the DataSource-provided context via the <HookLink name="useDataSourceState" /> hook that our component exposes.

</Note>

## Choosing what to render

Besides the flexibility of nesting your DataGrid component anywhere in your app, we also offer you the ability to choose what parts of the DataGrid you want to render and where.

Let's suppose you want to show the header after the body of the DataGrid or choose to insert something in between. That should be easy, right? **It is with Infinite!** - but try to do that with the other commercial DataGrids out there!

```tsx live tailwind file="./customizing-structure.page.tsx"

```

As demoed above, the good part is that you can very easily add additional elements to your structure and have the grouping toolbar displayed on the side, vertically.

```tsx {8} title="Example structure for vertical grouping toolbar"
<DataSource>
  <InfiniteTable>
    <div className="flex flex-1 flex-row">
      <div className="flex flex-1 flex-col">
        <InfiniteTable.Header />
        <InfiniteTable.Body />
      </div>
      <InfiniteTable.GroupingToolbar orientation="vertical" />
    </div>
  </InfiniteTable>
</DataSource>
```

<Note>

In the example above, try dragging the header of the `age` column onto the `GroupingToolbar` to add grouping by `age`.

</Note>

<!-- ```tsx live file="customizing-cells.page.tsx" tailwind
``` -->

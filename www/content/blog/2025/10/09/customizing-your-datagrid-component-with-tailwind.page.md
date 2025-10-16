---
title: Customizing your DataGrid component with Tailwind CSS
description: Find out how to customize your DataGrid component to fit your app needs, using Tailwind CSS
date: 2025-10-09
author: radu
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

## Usage with TailwindCSS

Our Tailwind DataGrid example below shows how you can leverage [Tailwind CSS](https://tailwindcss.com/) to style the DataGrid.

<Note>

When setting up InfiniteTable in a TailwindCSS app, you'll need to use the CSS layer that is defined in our styles, called `'infinite-table'`.

Basically, you have to update your app to list this CSS layer in the proper order.

[Tailwind CSS docs on layer ordering](https://tailwindcss.com/docs/preflight#overview) list the CSS layers that Tailwind works with.

```css title="Default tailwind CSS layer order"
@layer theme, base, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css" layer(utilities);

```

We need to insert `'infinite-table'` CSS layer before the Tailwind `'components'` layer, so Tailwind CSs can easily override our styles.

But we to put it before `'base'` so the Tailwind resets don't unexpectedly affect Infinite Table.


```css title="Tailwind CSS layers with infinite-table layer specified in the correct position"
@layer theme, base, infinite-table, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css" layer(utilities);

```
</Note>

<Sandpack>

<Description>

In this demo, hover over a cell to see a Tailwind color applied. This affects all cells, as the Tailwind CSS className was applied by overriding the `className` of all <PropLink name="columnTypes" />.

Also we applied `px-6` to change the horizontal padding.

</Description>


```tsx live file="customizing-cells.page.tsx" tailwind viewMode="preview" title="Using Tailwind to customize all cells"
```

</Sandpack>

## Advanced Tailwind configuration

The next example provides you with a more in-depth configuration.

<Note>

For changing the `className` for rows on hover, use the <PropLink name="rowHoverClassName" /> prop.

In this example, we applied `bg-orange-900/70!` (notice the Tailwind important `!` modifier) - because the default Infinite styles target the `background` of the rows, and not the `background-color` as Tailwind targets. Hence the important CSS modifier.

</Note>

```tsx live viewMode="preview" file="advanced-tailwind-configuration.page.tsx" tailwind title="Advanced Tailwind configuration"
```


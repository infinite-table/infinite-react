---
title: Column Sizing
---

Columns are a core concept for `Infinite Table` and sizing columns is an important topic to master. Here is a summary of how columns can be sized:

- fixed-sized columns can be specified via <PropLink name="columns.defaultWidth" />
- flexible columns need <PropLink name="columns.defaultFlex" />
- <PropLink name="columns.minWidth" /> specifies the minimum size for a column
- <PropLink name="columns.maxWidth" /> is for the maximum width a column can take
- default values are available for all of the above:
  - <PropLink name="columnDefaultWidth" /> gives all columns (that are otherwise unconfigured) a default size
  - <PropLink name="columnMinWidth" /> specifies the minimum width for all columns (that don't have one)
  - <PropLink name="columnMaxWidth" /> specifies the maximum width for all columns (that don't have one)

For fine-grained controlled-behavior on column sizing, use the controlled <PropLink name="columnSizing"/> prop (for uncontrolled variant, see <PropLink name="defaultColumnSizing" />). If you want to get updates to columns changing size as a result of user interaction, use <PropLink name="onColumnSizingChange" />.

<Note>

Use <PropLink name="columnDefaultWidth"/> to configure the default column width. If a column is not sized otherwise, this will be applied. The default value for <PropLink name="columnDefaultWidth"/> is `200` (pixels).

For setting a minimum and maximum width for all columns, use <PropLink name="columnMinWidth"/> (defaults to `30`) and <PropLink name="columnMaxWidth"/> (defaults to `2000`) respectively.

</Note>

## Understanding default column sizing

The easiest way to get started and specify a sizing behavior for columns is to use <PropLink name="columns.defaultWidth">column.defaultWidth</PropLink>, <PropLink name="columns.defaultFlex">column.defaultFlex</PropLink> and/or <PropLink name="columnDefaultWidth" /> (including related pros for specifying limits, like <PropLink name="columns.minWidth">column.minWidth</PropLink>, <PropLink name="columns.maxWidth">column.maxWidth</PropLink> and <PropLink name="columnMinWidth" /> / <PropLink name="columnMaxWidth" />).

Those properties have `default` in their name because after the initial rendering of a column, you can't change its size by updating those values - more technically, <PropLink name="columns.defaultWidth">column.defaultWidth</PropLink> and <PropLink name="columns.defaultFlex">column.defaultFlex</PropLink> are uncontrolled props.

We suggest you use those to get started and if you don't have care about responding to the user changing the widths of those columns via drag&drop. As long as you're not using <PropLink name="onColumnSizingChange" /> to be notified of column size changes, you're probably good with those.

## Controlled column sizing

However, once you start using <PropLink name="onColumnSizingChange" /> and want to have full control of column sizing (maybe you want to restore it later to the state the user had it when the app was closed), you probably want to use controlled <PropLink name="columnSizing" />.

The <PropLink name="columnSizing" /> prop is an object of column ids to column sizing objects. Those sizing objects can have the following properties:

- <PropLink name="columnSizing.flex">flex</PropLink> - use this for <b>flexible columns</b>. Behaves like the flex CSS property.
- <PropLink name="columnSizing.width">width</PropLink> - use this for <b>fixed sized columns</b>
- <PropLink name="columnSizing.minWidth">minWidth</PropLink> - specifies the minimum width of the column. Useful for flexible columns or for restricting users resizing both fixed and flexible columns.
- <PropLink name="columnSizing.maxWidth">maxWidth</PropLink> - specifies the maximum width of the column. Useful for flexible columns or for restricting users resizing both fixed and flexible columns.

<Note>

If a column is not specified in the <PropLink name="columnSizing" /> prop (or its uncontrolled variant), or sized otherwise (eg: via the column type), it will have a fixed size, defaulting to <PropLink name="columnDefaultWidth"/> (which also defaults to `200` if no value is passed in). You can also specify a <PropLink name="columnMinWidth" /> and <PropLink name="columnMaxWidth" /> - those will be applied for all columns (namely for those that dont explicitly specify other min/max widths).

</Note>

```tsx
const columnSizing: InfiniteTablePropColumnSizing = {
  country: {
    flex: 1,
    // minWidth is optional
    minWidth: 200,
  },
  city: {
    width: 400,
    // and so is maxWidth
    maxWidth: 500,
  },
  salary: {
    flex: 3,
  },
};
// any column not specified in the columnSizing (or defaultColumnSizing) prop
// will have fixed width (defaulting to `columnDefaultWidth`, which in turn defaults to 200px)
```

<Note>

You might find specifying the column size outside the column object to be a bit verbose to start with, but it will be easier to manage in many cases and is much more flexible. For example, when the user resizes a column via drag & drop and you want to persist the new column sizes, you don't have to update the whole `columns` object but instead update <PropLink name="columnSizing"/> alone.
The same principle is true for <PropLink name="columnPinning" /> and other column-level props.

</Note>

<Note>

The `columnSizing` prop also has an uncontrolled version, namely <PropLink name="defaultColumnSizing" />.

</Note>

## Using flexible column sizing

<Note>

The way flex sizing is implemented is similar to how CSS flexbox algorithm works. Explore this section to find out more details.

</Note>

Imagine you have `1000px` of space available to the viewport of `InfiniteTable` and you have 3 columns:

- a fixed column `100px` wide - name it col `A`
- a fixed column `300px` wide - name it col `B`
- a flexible column with `flex: 1` - name it col `F1`
- a flexible column with `flex: 2` - name it col `F2`

The space remaining for the flexible columns is `1000px - 400px = 600px` and the sum of all flex values is `3`, that means each `flex` unit will be `600px / 3 = 200px`.

This means columns will have the following sizes:

- col `A` will be `100px`
- col `B` will be `300px`
- col `F1` will be `200px` ( so a flex unit)
- col `F2` will be `400px` ( so the equivalent of `2` flex units)

If the browser changes the layout of the component, so `InfiniteTable` has only `700px` available, then a flex unit would be `(700px - 400px) / 3 = 100px`.

This means columns will have the following sizes:

- col `A` will be `100px`
- col `B` will be `300px`
- col `F1` will be `100px` ( so a flex unit)
- col `F2` will be `200px` ( so the equivalent of `2` flex units)

The flexbox algorithm also uses <PropLink name="viewportReservedWidth" /> to determine the width of the viewport to use for sizing columns - you can use <PropLink name="viewportReservedWidth">viewportReservedWidth=100</PropLink> to always have a `100px` reserved area that won't be used for flexing columns.

 <Sandpack title="Using viewportReservedWidth to reserve whitespace when you have flexible columns">

 <Description>

This example has a `viewportReservedWidth` of `50px`.

 </Description>

```tsx file="$DOCS/reference/viewportReservedWidth-example.page.tsx"

```

</Sandpack>

Take a look at the snippet below to see column sizing at work with flexible and fixed columns.

<Sandpack title="Using controlled columnSizing">

```tsx file="$DOCS/reference/columnSizing-example.page.tsx"

```

</Sandpack>

<Note>

You might find <PropLink name="viewportReservedWidth" /> useful for advanced configuration when you have flexible columns.

</Note>

<Note>

When he user is performing a column resize (via drag & drop), <PropLink name="onViewportReservedWidth" /> is called when the resize is finished (not the case for resizing with the **SHIFT** key pressed, when adjacent columns share the space between them).

</Note>

<Note>

You can also size (generated) group columns by using their <PropLink name="columns.id">column.id</PropLink> property.

For <PropLink name="groupRenderStrategy">groupRenderStrategy="multi-column"</PropLink>, if no `id` is specified in the group column configuration, each column will have a generated id like this: `"group-by-${field}"`.

For <PropLink name="groupRenderStrategy">groupRenderStrategy="single-column"</PropLink>, if no `id` is specified in the <PropLink name="groupColumn" /> it will default to: `"group-by"`.

</Note>

## Resizing columns via drag & drop

Columns are user-resizable via drag & drop. If you don't want a column to be resizable, specify <PropLink name="columns.resizable">column.resizable=false</PropLink>

<Note>

By default, all columns are resizable since <PropLink name="resizableColumns" /> defaults to `true`. The <PropLink name="resizableColumns" /> prop controls the behavior for all columns that don't explicitly specify their <PropLink name="columns.resizable">column.resizable</PropLink> property.

</Note>

When initially rendered, columns are displayed with their <PropLink name="columns.defaultWidth" /> (you can also use <PropLink name="columnDefaultWidth" />) or <PropLink name="columns.defaultFlex" />. Flexible columns take up available space taking into account their flex value, as detailed above.

When the user is resizing columns (or column groups), the effect is seen in real-time, so it's very easy to adjust the columns to desired widths. After the user drops the resize handle to the desired position, <PropLink name="onColumnSizingChange" /> is being called, to allow the developer to react to column sizing changes. Also <PropLink name="onViewportReservedWidth" /> is called as well when the resize is finished (not the case for resizing with the **SHIFT** key pressed, when adjacent columns share the space between them).

<Note>

When flexible columns are resized, they are kept flexible even after the resize. Note however that their flex values will be different to the original flex values and will reflect the new proportions each flex column is taking up at the moment of the resize.

More exactly, the new flex values will be the actual pixel widths. As an example, say there are 2 flex columns, first one with flex `1` and second one with flex `3` and they have an available space of `800px`.

```ts
const columns = {
  first: { flex: 1, field: 'one' },
  second: { flex: 2, field: 'two' },
};
```

Initially they will occupy `200px` and `600px` respectively. If the user resizes them to be of equal size, <PropLink name="onColumnSizingChange" /> will be called with an object like

```ts
{
  first: { flex: 400 },
  second: {flex: 400 }
}
```

since those are the actual widths measured from the DOM. This works out well, even if the available space of the table grows, as the proportions will be the same.

</Note>

### Resize Restrictions

When resizing, the user needs to drag the resize handle to adjust the columns to new sizes. While doing so, the resize handle has a (green) color to indicate everything is okay. However, when restrictions are hit (either column <PropLink name="columns.minWidth">min</PropLink> or <PropLink name="columns.maxWidth">max</PropLink> widths), the resize handle turns red to indicate further resizing is not possible.

### Sharing space on resize

By default when resizing a specific column, the following columns are pushed to the right (when making the column wider) or moved to the left (when making the column narrower).

For sharing space between resizable columns when resizing, the user needs to **hold the SHIFT key** when grabbing the resize handle. When the handle is dropped and the resize confirmed, <PropLink name="onColumnSizingChange" /> is called, but <PropLink name="onViewportReservedWidth" /> is not called for this scenario, since the reserved width is preserved.

### Resizing column groups

Just as columns are being resized, it is also possible to resize column groups. For this, the user needs to hover over the right border of the column group and start dragging the resize handle.

<Note>

For multi-level column groups, it's possible to resize any of them. Just grab the handle from the desired group and start dragging. The handle height will indicate which column group is being resized.

</Note>

<Note>

If a column group has at least one resizable column, it can be resized.

When resizing, the space is shared proportionally betweem all resizable columns in the group.

Once a min/max limit has been reached for a certain column in the group, the column respects the limit and the other columns keep resizing as usual. When the min/max limit has been reached for all columns in the group, the resize handle turns red to indicate further resizing is no longer possible.

</Note>

<Sandpack title="Resizing column groups">
<Description>

Try resizing the `Finance` and `Regional Info` column groups.

The columns in the `Finance` group can be resized an extra `30px` (they have a `maxWidth` of `130px`).

</Description>

```tsx file="$DOCS/reference/column-groups-example.page.tsx"

```

</Sandpack>

### Customizing the resize handle colors

It's possible to customize the resize handle colors and width.

For adjusting the handle colors, use the following CSS variables:

- `--infinite-resize-handle-hover-background` - the color of the resize handle when it's in a `green`/all good state.
- `--infinite-resize-handle-constrained-hover-background` - the color of the resize handle when it has reached a min/max constraint.

You can also adjust the width of the resize handle:

- `--infinite-resize-handle-width` - the width of the `green`/`red` column resize handle. Defaults to `2px`
- `--infinite-resize-handle-active-area-width` - the width of the area you can hover over in order to grab the resize handle. Defaults to `20px`. The purpose of this active area is to make it easier to grab the resize handle.

## Auto-sizing columns

For sizing columns to the width of their content, you can use <PropLink name="autoSizeColumnsKey" /> to declaratively auto-size columns:

- when <PropLink name="autoSizeColumnsKey" /> is a `string` or `number` and the value of the prop is changed, all columns will be auto-sized.
- when <PropLink name="autoSizeColumnsKey" /> is an object, it needs to have a `key` property (of type `string` or `number`), so whenever the `key` changes, the columns will be auto-sized. Specifying an object for <PropLink name="autoSizeColumnsKey" /> gives you more control over which columns are auto-sized and if the size measurements include the header or not.

When an object is used, the following properties are available:

- `key` - mandatory property, which, when changed, triggers the update
- `includeHeader` - optional boolean, - decides whether the header will be included in the auto-sizing calculations. If not specified, `true` is assumed.
- `columnsToSkip` - a list of column ids to skip from auto-sizing. If this is used, all columns except those in the list will be auto-sized.
- `columnsToResize` - the list of column ids to include in auto-sizing. If this is used, only columns in the list will be auto-sized.

<Sandpack title="Auto-sizing columns">

```tsx file="$DOCS/reference/autoSizeColumnsKey-example.page.tsx"

```

</Sandpack>

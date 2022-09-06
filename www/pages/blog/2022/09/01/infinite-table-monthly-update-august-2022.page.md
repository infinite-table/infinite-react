---
title: "Monthly Update - August 2022"
description: "Infinite Table update for August 2022 - row selection, column rendering, group columns"
author: [admin]
---
In August, we continued our work on preparing for our Autumn release, mainly focusing on adding new functionalities and documenting them thoroughly, along with improving existing features and documentation.


## Summary 

We have implemented a few new functionalities:

 * [row selection](#row-selection) is now available
 * [column rendering pipeline](#column-rendering-pipeline)
 * [group columns](#sortable-group-columns) are now sortable
 

And we have updated some of the existing features:

 * [group columns inherit](#enhanced-group-columns) styles and configuration
 * [column hiding when grouping](#column-hiding-when-grouping)
 * [group columns can be bound to a field](#group-columns-bound-to-a-field)
 * [using the column valueGetter in sorting](#column-valuegetter-in-sorting)
 
<Note title="Coming soon">

We started working on adding support for column menus and context menus. This will allow you to have fully customizable column menus to show/hide columns and to easily perform other operations on columns. 
As soon as this ships, we'll also have context menus so you will be able to define your own custom actions on rows/cells in the table.

---

Don't worry, the menus will be fully customizable, the menu items are fully replaceable with whatever you need, or you will be able to swap our menu component with a custom one of your own.

</Note>

## New Features

Here's what we shipped in the month of August:

### Row Selection

Row selection can be single or multiple, with or without a checkbox, with or without grouping and for a lazy or non-lazy `DataSource` - 😅 that was a long enumeration, but seriously, we think we got something great out there. Specify the selection via the <DPropLink name="rowSelection" /> (controlled) or <DPropLink name="defaultRowSelection" /> (uncontrolled) props, and listen to changes via the <DPropLink name="onRowSelectionChange" /> callback prop.

<Sandpack title="Multi row checkbox selection with grouping" >

<Description>

This example shows how you can use multiple row selection with a predefined controlled value.

Go ahead and select some groups/rows and see the selection value adjust.

The example also shows how you can use the [InfiniteTableApi](/docs/latest/reference/api) to retrieve the actual ids of the selected rows.

</Description>


```ts file=../../../../docs/latest/reference/controlled-multi-row-selection-example.page.tsx
```

</Sandpack>


<YouWillLearnCard inline title="Find out more on row selection" path="/docs/latest/learn/selection/row-selection">

Single vs multiple selection, grouped or ungrouped data, checkbox selection, lazy selection - read about all the possible combinations you can use to fit your needs.

</YouWillLearnCard>


### Column Rendering Pipeline

The rendering pipeline for columns is a series of functions defined on the column that are called while rendering. Most of those functions existed even before, but piping the return values from one to the other was not available. We think this is a big deal and opens up lots of use-cases.

<Note>

All the columns that have `render` in their name, will be called with an object that has a `renderBag` property on it, which contains the values that the previous function in the pipeline returned.

</Note>

For example:

```tsx
const column: InfiniteTableColumn<T> = {
  valueGetter: ({ data, field }) => {
    return data[field] * 10
  },
  renderValue: ({ value, renderBag })=> {
    // accessing `value` here would give us the result from `data[field]`
    // but using `renderBag.value` would give us `data[field] * 10`, 
    // namely the result of the previous function in the pipeline
  }
}
```

Second example:

```tsx
const column: InfiniteTableColumn<T> = {
  renderGroupIcon: ({ renderBag }) => {
    // we can use `renderBag.groupIcon` to have access to the default group icon and decorate it
    return <b style={{ padding: 10 }}>
      {renderBag.groupIcon}
    </b>
  },

  render: ({ renderBag })=> {
    // allows you to fully customize the end-result
    <>
      {renderBag.value}
      {renderBag.groupIcon}
      {renderBag.selectionCheckBox}
    </>
  }
}
```

These are all the properties available in the `renderBag` object:

 * `value`
 * `groupIcon`
 * `selectionCheckBox`

Here is the full list of the functions in the rendering pipeline, in order of invocation:

1.<PropLink name="columns.valueGetter" /> - doesn't have access to `renderBag`
2.<PropLink name="columns.valueFormatter" /> - doesn't have access to `renderBag`
3.<PropLink name="columns.renderGroupIcon" /> - can use all properties in `renderBag`
4.<PropLink name="columns.renderSelectionCheckBox" /> - can use all properties in `renderBag`
5.<PropLink name="columns.renderValue" /> - can use all properties in `renderBag`
6.<PropLink name="columns.renderGroupValue" /> - can use all properties in `renderBag`
7.<PropLink name="columns.renderLeafValue" /> - can use all properties in `renderBag`
8.<PropLink name="columns.render" /> - can use all properties in `renderBag`

Additionally, the <PropLink name="columns.components.ColumnCell" /> custom component does have access to the `renderBag` via <HookLink name="useInfiniteColumnCell" />

### Sortable Group Columns

When <PropLink name="groupRenderStrategy">groupRenderStrategy="single-column"</PropLink> is used, the group column is sortable by default if all the columns that are involved in grouping are sortable. Sorting the group column makes the `sortInfo` have a value that looks like this:


```ts
const sortInfo = [
  { field: ['stack','age'], dir: 1, id: 'group-by', }
]
```

 <PropLink name="groupRenderStrategy">groupRenderStrategy="multi-column"</PropLink>, each group column is sortable by default if the column with the corresponding field is sortable.

 <Note>

 Both in single and multi group column render strategy, the <PropLink name="columns.sortable" /> property can be used to override the default behavior.

 </Note>



## Updated Features

Here's a list of updated functionalities that we added in the last month:


### Enhanced Group Columns

Group columns now inherit configuration from the columns bound to the field they are grouped by - if such columns exist.


 
<Sandpack title="Group column inherits style from related column">

<Description>

In this example, the group column inherits the styling of the `country` column, because the `country` field is used for grouping.

</Description>

```ts file=../../../../docs/latest/learn/grouping-and-pivoting/row-grouping-example.page.tsx
```

</Sandpack>


<Note>

The generated group column(s) - can be one for all groups or one for each group - will inherit the `style`/`className`/renderers from the columns corresponding to the group fields themselves (if those columns exist).

Additionally, there are other ways to override those inherited configurations, in order to configure the group columns:
 * use <DPropLink name="groupBy.column" /> to specify how each grouping column should look for the respective field (in case of <PropLink name="groupRenderStrategy">groupRenderStrateg="multi-column"</PropLink>)
 * use <PropLink name="groupColumn" /> prop 
    * can be used as an object - ideal for when you have simple requirements and when <PropLink name="groupRenderStrategy">groupRenderStrateg="single-column"</PropLink>
    * as a function that returns a column configuration - can be used like this in either single or multiple group render strategy

</Note>



### Column Hiding when Grouping

When grouping is enabled, you can choose to hide some columns. Here are the two main ways to do this:

 * use <PropLink name="hideColumnWhenGrouped" /> - this will make columns bound to the group fields be hidden when grouping is active
 * use <PropLink name="columns.defaultHiddenWhenGroupedBy" /> (also available on the column types, as <PropLink name="columnTypes.defaultHiddenWhenGroupedBy" />) - this is a column-level property, so you have more fine-grained control over what is hidden and when.

Valid values for <PropLink name="columns.defaultHiddenWhenGroupedBy" /> are:

 * `"*"` - when any grouping is active, hide the column that specifies this property
 * `true` - when the field this column is bound to is used in grouping, hides this column
 * `keyof DATA_TYPE` - specify an exact field that, when grouped by, makes this column be hidden
 * `{ [k in keyof DATA_TYPE]: true}` - an object that can specify more fields. When there is grouping by any of those fields, the current column gets hidden.

 
<Sandpack title="Hide columns when grouping">

<Description>

In this example, the column bound to `firstName` field is set to hide when any grouping is active, since the group column is anyways found to the `firstName` field.

In addition, <PropLink name="hideColumnWhenGrouped" /> is set to `true`, so the `stack` and `preferredLanguage` columns are also hidden, since they are grouped by.

</Description>

```ts file=../../../../docs/latest/reference/hide-columns-when-grouping-example.page.tsx
```

</Sandpack>


### Group Columns Bound to a Field 

Group columns can now be bound to a field, by leveraging the (obviously ...) <PropLink name="columns.field" /> property. This will make the group column render the value of that field for non-group rows.


<Sandpack title="Group columns with field">

```ts file=../../../../docs/latest/reference/group-column-bound-to-field-example.page.tsx
```

</Sandpack>

In addition, you can now use <PropLink name="columns.renderGroupValue" /> and <PropLink name="columns.renderLeafValue" /> for configuring the rendered value for grouped vs non-grouped rows.


### Column valueGetter in Sorting

<PropLink name="columns.valueGetter" /> is now used for local sorting if the sorted column has one defined.
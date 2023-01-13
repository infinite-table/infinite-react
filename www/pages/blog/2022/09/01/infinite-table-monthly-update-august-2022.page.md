---
title: "Monthly Update - Summer 2022"
description: "Infinite Table update for Summper 2022 - row selection, column rendering, group columns"
author: [admin]
---
Over the summer, we continued our work on preparing for our official release, focusing mainly on adding new functionalities and documenting them thoroughly, together with enhancements to existing features.


## Summary 

We have implemented a few new functionalities, including:

 * [row selection is now available 🎉](#row-selection)
 * [column rendering pipeline](#column-rendering-pipeline)
 * [group columns are now sortable 🔃](#sortable-group-columns)
 

And we have updated some of the existing features:

 * [group columns inherit](#enhanced-group-columns) styles and configuration
 * [column hiding when grouping](#column-hiding-when-grouping)
 * [group columns can be bound to a field](#group-columns-bound-to-a-field)
 * [using the column valueGetter in sorting](#column-valuegetter-in-sorting)
 
<Hint title="Coming soon">

We started working on column and context menus.
We will first release fully customizable **column** menus to show/hide columns and to easily perform other operations on columns.
This will be followed by **context** menus where you will be able to define your own custom actions on rows/cells in the table.

---

Don't worry, the menus will be fully customizable, the menu items are fully replaceable with whatever you need, or you will be able to swap our menu component with a custom one of your own.

</Hint>

## New Features

Here's what we shipped over the summer:

### Row Selection

Row selection can be single or multiple, with or without a checkbox, with or without grouping and for a lazy or non-lazy `DataSource` - 😅 that was a long enumeration, but seriously, we think we got something great out there.

You can specify the selection via the <DPropLink name="rowSelection" /> (controlled) or <DPropLink name="defaultRowSelection" /> (uncontrolled) props, and listen to changes via the <DPropLink name="onRowSelectionChange" /> callback prop.

<CSEmbed id="infinite-table-multi-row-checkbox-selection-with-grouping-i9wi88" title="Multi row checkbox selection with grouping" >

<Description>

* Example shows how you can use multiple row selection with a predefined controlled value.

* Go ahead and select some groups/rows and see the selection value adjust.

* Example also shows how you can use the [InfiniteTableApi](/docs/reference/api) to retrieve the actual ids of the selected rows.

</Description>


</CSEmbed>


<YouWillLearnCard inline title="Find out more on row selection" path="/docs/learn/selection/row-selection">

Single vs multiple selection, grouped or ungrouped data, checkbox selection, lazy selection - read about all the possible combinations you can use to fit your needs.

</YouWillLearnCard>


### Column Rendering Pipeline

The rendering pipeline for columns is a series of functions defined on the column that are called while rendering.

<Note>

All the functions that have the word `render` in their name will be called with an object that has a `renderBag` property, which contains values that will be rendered.

</Note>

The default <PropLink name="columns.render" /> function (the last one in the pipeline) ends up rendering a few things:

 * a `value`  - generally comes from the <PropLink name="columns.field">field</PropLink> the column is bound to
 * a `groupIcon` - for group columns
 * a `selectionCheckBox` - for columns that have <PropLink name="columns.renderSelectionCheckBox" /> defined (combined with row selection)

When the rendering process starts for a column cell, all the above end up in the `renderBag` object.

For example:

```tsx {3,12}
const column: InfiniteTableColumn<T> = {
  valueGetter: () => 'world',
  renderValue: ({ value, renderBag, rowInfo }) => {
    // at this stage, `value` is 'world' and `renderBag.value` has the same value, 'world'
    return <b>{value}</b>
  },

  render: ({ value, renderBag, rowInfo }) => {
    // at this stage `value` is 'world'
    // but `renderBag.value` is <b>world</b>, as this was the value returned by `renderValue`
    return <div>
      Hello {renderBag.value}!
    </div>
  }
}
```


<YouWillLearnCard  title="Find out more on column rendering" path="/docs/learn/columns/column-rendering#rendering-pipeline">

Read about how using the rendering pipeline helps your write less code.

</YouWillLearnCard>

Here is the full list of the functions in the rendering pipeline, in order of invocation:

1.<PropLink name="columns.valueGetter" /> - doesn't have access to `renderBag`
2.<PropLink name="columns.valueFormatter" /> - doesn't have access to `renderBag`
3.<PropLink name="columns.renderGroupIcon" /> - can use all properties in `renderBag`
4.<PropLink name="columns.renderSelectionCheckBox" /> - can use all properties in `renderBag`
5.<PropLink name="columns.renderValue" /> - can use all properties in `renderBag`
6.<PropLink name="columns.renderGroupValue" /> - can use all properties in `renderBag`
7.<PropLink name="columns.renderLeafValue" /> - can use all properties in `renderBag`
8.<PropLink name="columns.render" /> - can use all properties in `renderBag`

Additionally, the <PropLink name="columns.components.ColumnCell" /> custom component has access to the `renderBag` via <HookLink name="useInfiniteColumnCell" />

### Sortable Group Columns

When <PropLink name="groupRenderStrategy">groupRenderStrategy="single-column"</PropLink> is used, the group column is sortable by default if all the columns that are involved in grouping are sortable.

Sorting the group column makes the `sortInfo` have a value that looks like this:


```ts
const sortInfo = [
  { field: ['stack','age'], dir: 1, id: 'group-by', }
]
```

When <PropLink name="groupRenderStrategy">groupRenderStrategy="multi-column"</PropLink>, each group column is sortable by default if the column with the corresponding field is sortable.

 <Hint>

In both single and multi group column render strategy, you can use the <PropLink name="columns.sortable" /> property to override the default behavior.

 </Hint>



## Updated Features

Here’s a list of Infinite Table functionalities that we enhanced in the last month:

### Enhanced Group Columns

Group columns now inherit configuration from the columns bound to the field they are grouped by - if such columns exist.

 
<CSEmbed id="infinite-table-group-column-inherits-style-from-related-column-v16qfg" title="Group column inherits style from related column">

<Description>

In this example, the group column inherits the styling of the `country` column, because the `country` field is used for grouping.

</Description>

</CSEmbed>


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
 * `{[k in keyof DATA_TYPE]: true}` - an object that can specify more fields. When there is grouping by any of those fields, the current column gets hidden.

 
<CSEmbed id="infinite-table-hide-columns-when-grouping-41o64x" title="Hide columns when grouping">

<Description>

In this example, the column bound to `firstName` field is set to hide when any grouping is active, since the group column is anyways found to the `firstName` field.

In addition, <PropLink name="hideColumnWhenGrouped" /> is set to `true`, so the `stack` and `preferredLanguage` columns are also hidden, since they are grouped by.

</Description>

</CSEmbed >


### Group Columns Bound to a Field 

Group columns can now be bound to a field, by leveraging the (obviously ...) <PropLink name="columns.field" /> property. This will make the group column render the value of that field for non-group rows.


<CSEmbed id="infinite-table-group-column-bound-to-field-6mjpzr" title="Group columns with field">


</CSEmbed>

In addition, you can now use <PropLink name="columns.renderGroupValue" /> and <PropLink name="columns.renderLeafValue" /> for configuring the rendered value for grouped vs non-grouped rows.


### Column valueGetter in Sorting

Columns allow you to define a <PropLink name="columns.valueGetter">valueGetter</PropLink> to change the value they are rendering (e.g. useful when the `DataSet` has nested objects). 

Previously, this value returned by <PropLink name="columns.valueGetter" /> was not used when sorting the table. With the latest update, the value returned by  <PropLink name="columns.valueGetter">valueGetter</PropLink> is correctly used when sorting the grid locally.
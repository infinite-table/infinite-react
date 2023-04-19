---
title: "Quarterly Update - Spring 2022"
description: "Infinite Table update for Spring 2022"
author: [admin]
excerpt: "Infinite Table update for Spring 2022"
---
This spring, we've been hard at work preparing for our Autumn release.

We have implemented a few new functionalities:

 * [column resizing](#column-resizing) is now available
 * [column reordering](#column-reordering) can be achieved via drag & drop
 * [keyboard navigation](#keyboard-navigation) with support for both row and cell navigation

And we have updated some of the existing features:

 * [lazy grouping](#lazy-grouping) 
    - expands lazy loaded rows correctly and 
    - also the server response can contain multiple levels of `children`, which basically allows the backend to send more data for groups you don't want to load lazily
 * [column groups](#column-grouping) are now improved with support for proportional column resizing
 * [pivot columns](#pivoting) are now easier to style and customize

<Note title="Coming soon">

At the end of the spring, we started working on row and cell selection and we've made good progress on it.

Row selection is already implemented for non-lazy group data and we're working on integrating it with lazy group data (e.g groups lazily loaded from the server). Of course, it will have integration with checkbox selection.

Multiple row selection will have 2 ways to select data:
 - via mouse/keyboard interaction - we've emulated the behavior you're used to from your Finder in MacOS.
 - via checkbox - this is especially useful when the table is configured with grouping.

</Note>

## New Features

### Column Resizing

By default columns are now resizable. You can control this at column level via <PropLink name="columns.resizable">column.resizable</PropLink> or at grid level via <PropLink name="resizableColumns" />.

<YouWillLearnCard inline title="Find out more on column resizing" path="/docs/learn/columns/fixed-and-flexible-size">

Read more about how you can configure column resizing to fit your needs.

</YouWillLearnCard>


<CSEmbed id="infinite-table-resizable-columns-example-gq0fnv" title="Resizable columns example">

<Description>
For resizable columns, hover the mouse between column headers to grab & drag the resize handle.

Hold SHIFT when grabbing in order to **share space on resize**.
</Description>

</CSEmbed>

A nice feature is support for SHIFT resizing - which will share space on resize between adjacent columns - try it in the example above.


### Column Reordering

<YouWillLearnCard inline title="Read more on column order" path="/docs/learn/columns/column-order">

Column order is a core functionality of `InfiniteTable` - read how you can leverage it in your app.

</YouWillLearnCard>

The default column order is the order in which columns appear in the columns object, but you can specify a <PropLink name="defaultColumnOrder" /> or tightly control it via the controlled property <PropLink name="columnOrder" /> - use <PropLink name="onColumnOrderChange" /> to get notifications when columns are reordered by the user.

<CSEmbed title="Column order" id="infinite-table-column-order-advanced-example-ro12mu">

</CSEmbed>

### Keyboard Navigation

Both cell and row navigation is supported - use <PropLink name="keyboardNavigation" /> to configure it. By default, cell navigation is enabled.


<CSEmbed title="Keyboard navigation" id="infinite-table-keyboard-navigating-cells-uncontrolled-tvwkmq">

<Description>

This example starts with cell `[2,0]` already active.

</Description>

</CSEmbed>


## Updated Features

### Lazy grouping

Server side grouping has support for lazy loading - `InfiniteTable` will automatically load lazy rows that are configured as expanded.

<CSEmbed id="infinite-table-lazy-grouping-with-expanded-rows-pkihtt" title="Lazy loaded rows are properly expanded">

<Description>

In this example, `France` is specified as expanded, so as soon as it is rendered, `InfiniteTable` will also request its children.

</Description>

</CSEmbed>

Another nice feature is the ability for a group node to also contain its direct children in the server response, which basically allows the backend to eagerly load data for certain groups.


<YouWillLearnCard inline title="More on lazy grouping" path="/docs/learn/grouping-and-pivoting/grouping-rows#server-side-grouping-with-lazy-loading">

Lazy grouping (with or without batching) is an advanced feature that allows you to integrate with huge datasets without loading them into the browser.

</YouWillLearnCard>

### Column grouping

Column grouping was enhanced with support for pinned columns. Now you can use them in combination.


<YouWillLearnCard inline title="More on column groups" path="/docs/learn/columns/column-grouping">

Column groups is a powerful way to arrange columns to fit your business requirements - read how easy it is to define them.

</YouWillLearnCard>

<CSEmbed id="infinite-table-column-groups-with-pinning-ks16dp" title="Column groups with pinning">

<Description>

Note the `country` column is pinned at the start of the table but is also part of a column group

</Description>


</CSEmbed>


### Pivoting

Pivot columns are now easier to style and benefit from piped rendering to allow maximum customization.

<YouWillLearnCard inline title="Pivoting docs" path="/docs/learn/grouping-and-pivoting/pivoting/overview">

Pivoting is probably our most advanced use-case. We offer full support for server-side pivoting and aggregations.

</YouWillLearnCard>

<CSEmbed id="infinite-table-custom-rendering-for-pivot-p2ern7" title="Customized pivot columns">

<Description>

Pivot columns for the `canDesign` field are customized.

</Description>

</CSEmbed>

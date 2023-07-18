---
title: "Infinite Table DataGrid for React reaches version 2.0.0"
description: "With version 2.0.0 InfiniteTable DataGrid for React brings lots of fixes and enhancements including support for sorting group columns, better APIs, improved pivoting, smarter column menus and more."
author: [admin]
---

Version `2.0.0` is a release that allowed us to polish many areas of the component and consolidate its existing features and APIs.

We hope this makes your experience with Infinite Table as your React DataGrid of choice even better.

Though it doesn't add major new features, this version does improve the overall experience of using the component. In this article we're detailing the most important improvements this release brings.


<Note title="Version 2.0.0 highlights 🎉">

 1️⃣ [better support for sorting group columns](#1-better-support-for-sorting-group-columns)
 2️⃣ [allows configuring the behavior when multiple sorting is enabled](#2-multi-sort-behavior)
 3️⃣ [smarter column menus](#3-smarter-column-menus)
 4️⃣ [improved support for boolean pivot columns](#4-improved-support-for-boolean-pivot-columns)
 5️⃣ [better and more exhaustive APIs](#5-better-and-more-exhaustive-apis)

</Note>



<YTEmbed url="https://www.youtube.com/embed/rhoj66cPzYM" />

## 1️⃣ Better support for sorting group columns

Before version `2.0.0`, group columns were sortable, but only if the configured `groupBy` fields were bound to actual columns.

This release enables you to make group columns sortable even when other columns are not defined. For this to work, you have to specify a <PropLink name="columns.sortType">sortType</PropLink> as an array, so the column knows how to sort the group values.

```tsx title="Configuring sortType for group columns"
<InfiniteTable<Developer>
  groupColumn={{
    sortType: ["string", "number"],
    field: "firstName",
    defaultWidth: 150
  }}
  groupRenderStrategy="single-column"
  columns={columns}
  columnDefaultWidth={120}
/>
```
<CSEmbed title="Sorting group columns is now possible" id="sorting-group-columns-forked-gv5n3z" />

## 2️⃣ Multi sort behavior

We have introduced <PropLink name="multiSortBehavior" /> to allow you to configure how the component behaves when multiple sorting is enabled. Two options are available:

* `append` - when this behavior is used, clicking a column header adds that column to the alredy existing sort. If the column is already sorted, the sort direction is reversed. In order to remove a column from the sort, the user needs to click the column header in order to toggle sorting from ascending to descending and then to no sorting.

* `replace` - the default behavior - a user clicking a column header removes any existing sorting and sets that column as sorted. In order to add a new column to the sort, the user needs to hold the `Ctrl/Cmd` key while clicking the column header.

<PropLink name="multiSortBehavior">multiSortBehavior="replace"</PropLink> is the new default behavior, and also a more natural one, so we recommend using it.


<CSEmbed title="Click column headers to see multi sort behavior in action - try clicking 'preferredLanguage' and 'salary'" id="spring-snowflake-mh6wpl" />


## 3️⃣ Smarter column menus

Column menus are now smarter - in previous versions of Infinite Table, users were able to hide the column that had the menu opened, and the menu would hang in its initial position.

When this happens, in version `2.0.0`, the menu realigns itself to other existing columns, thus providing a better user experience.

## 4️⃣ Improved support for boolean pivot columns

It's pretty common to pivot by boolean columns, and this is now fully supported in Infinite Table. Previous to version `2.0.0`, the column headers for boolean pivot columns were not rendered correctly.

<CSEmbed title="Boolean pivot columns are now supported" id="lively-microservice-xtyyk7" />


## 5️⃣ Better and more exhaustive APIs

We have improved our APIs, with new methods and fixes. Among other things, we've polished our [Column API](/docs/reference/column-api) to offer you the ability to do more with your columns. Previously there were things that were only possible to do if you had access to the internal state of the component, but now we've moved more things to the API.

For example, our column sorting code is now centralised, and using <ColumnApiLink name="toggleSort" /> gives you the same action as clicking a column header (this was not the case previously).

We've added quite a few more methods to our APIs, here's some of the most important ones:

 - ColumnAPI.<ColumnApiLink name="toggleSort" />
 - ColumnAPI.<ColumnApiLink name="setSort" />
 - ColumnAPI.<ColumnApiLink name="getSortDir" />
 - ColumnAPI.<ColumnApiLink name="clearSort" />
 - ColumnAPI.<ColumnApiLink name="isSortable" />

## Conclusion

We've been working on version `2.0.0` for a few months now and we hope you'll enjoy all the little details that make this version a better product, with all the improvements it brings in various areas of the component.

We'd love to hear your feedback, so please reach out to us via email at <a href="mailto:admin@infinite-table.com" className=" text-glow " > admin@infinite-table.com </a> or follow us [@get_infinite](https://twitter.com/get_infinite) to keep up-to-date with news about the product. 

Thank you 🙌
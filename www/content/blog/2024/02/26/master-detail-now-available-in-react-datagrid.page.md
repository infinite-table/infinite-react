---
title: Master detail is now available in the Infinite React DataGrid
author: admin
---

Today is a big day for the Infinite React DataGrid - we're excited to announce that the master detail feature is now available!

With this addition, our DataGrid is now enterprise-ready! We know master-detail scenarios are needed in many business applications, and we're happy to provide this feature to our users starting today!

<Note title="Master-detail highlights 🎉">

1️⃣ [support for multiple levels of master-detail & rendering custom content](#what-can-you-do-with-master-detail)
2️⃣ [configurable detail height](#configurable-detail-height)
3️⃣ [control over expand/collapse state](#configurable-expandcollapse-state)
4️⃣ [caching mechanism for detail DataGrids](#master-detail-caching)

</Note>

## What can you do with master-detail?

Master-detail allows you to have rows in the DataGrid that expand to show more details. This can be used to show more information about the row, or even to show another DataGrid with related data.

You can render basically anything in the detail row - it doesn't need to be another DataGrid. However, if you do want to show another DataGrid, you can, and you can do that at any level of depth.

In the detail `<DataSource />` component, you have access to the master row, so it will be very easy to load related data based on the master row the user expands.

<CSEmbed id="tender-cdn-9cpznx" code={false} size="md" title="Basic master detail DataGrid example"/>

## Configurable detail height

Our master-detail implementation is very configurable - you can control the height of the row details, the expand/collapse state, and much more.

The height of the row details is fully adjustable - see the <PropLink name="rowDetailHeight" /> prop to learn about all the options you have.

<CSEmbed id="beautiful-sammet-3gkwn9" code={false} size="md" title="Master detail with custom row detail height and custom content" />

As seen in the snippet above, it's also really easy to control the expand/collapse state of the row details. You can choose to have some rows expanded by default so details of those rows will be visible from the start.

## Configurable expand/collapse state

Using the <PropLink name="rowDetailState" />, you can control (in a declarative way) which rows are expanded and which are collapsed. In addition, if you prefer the imperative approach, we also have an [API to work with row details](/docs/reference/row-detail-api).

If you have some rows with details and some without, that's also covered. Use the <PropLink name="isRowDetailEnabled" /> to control which rows will have details and which will not.

<Note>

Another important configuration is choosing the column that has the row detail expand/collapse icon. Use the <PropLink name="columns.renderRowDetailIcon" /> prop on the column that needs to display the expand/collapse icon. If this prop is a function, it can be used to customize the icon rendered for expanding/collapsing the row detail.

</Note>

## Master detail caching

By far the most common scenario will be to render another DataGrid in the detail row.

For such cases we offer a caching mechanism that will keep the state of the detail DataGrid when the user collapses and then expands the row again.

<Note>

To enable caching, use the <PropLink name="rowDetailCache" /> prop.

It can be one of the following:

- `false` - caching is disabled - this is the default
- `true` - enables caching for all detail DataGrids
- `number` - the maximum number of detail DataGrids to keep in the cache. When the limit is reached, the oldest detail DataGrid will be removed from the cache.

</Note>

<CSEmbed id="thirsty-browser-xxf6wf" code={false} size="md" title="Master detail DataGrid with caching for 5 detail DataGrids">

<Description>

This example will cache the last 5 detail DataGrids - meaning they won't reload when you expand them again.
You can try collapsing a row and then expanding it again to see the caching in action - it won't reload the data.
But when you open up a row that hasn't been opened before, it will load the data from the remote location.

</Description>

</CSEmbed>

Read our docs on [caching detail DataGrids](/docs/learn/master-detail/caching-detail-datagrid) to learn more how you can use this feature to improve the user experience.

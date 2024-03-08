---
title: Master Detail - Caching Detail DataGrid
description: Learn how to use master-detail with caching for a better user-experience
---

By far the most common scenario will be to render another DataGrid in the detail row.

For such cases we offer a caching mechanism that will keep the state of the detail DataGrid when the user collapses and then expands the row again.

<Note>

The most important part of the state of detail DataGrid that will be cached is the data-related.

More specifically, when cached, the detail `<DataSource />` will get its data from the cache and will not call the <DPropLink name="data" /> function when mounted.

Other persisted parts of the state are the sorting, filtering and grouping information.

</Note>

To enable caching, use the <PropLink name="rowDetailCache" /> prop.

It can be one of the following:

- `false` - caching is disabled - this is the default
- `true` - enables caching for all detail DataGrids
- `number` - the maximum number of detail DataGrids to keep in the cache. When the limit is reached, the oldest detail DataGrid will be removed from the cache.

<Sandpack title="Master detail DataGrid with caching for 5 detail DataGrids" size="lg" viewMode="preview">

<Description>

This example will cache the last 5 detail DataGrids - meaning they won't reload when you expand them again.
You can try collapsing a row and then expanding it again to see the caching in action - it won't reload the data.
But when you open up a row that hasn't been opened before, it will load the data from the remote location.

</Description>

```ts file=master-detail-caching-with-default-expanded-example.page.tsx

```

</Sandpack>

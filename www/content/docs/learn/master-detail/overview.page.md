---
title: Master Detail
description: Learn how to use master-detail rendering with the React DataGrid
---

The React DataGrid that Infinite Table offers has native support for master-detail rows.

<Note>

The single most important property for the master-detail DataGrid configuration is the <PropLink name="rowDetailRenderer" /> function prop. If the prop is specified, the DataGrid is considered master-detail.

In addition, make sure you have a column with the `renderRowDetailsIcon: true` flag set. <PropLink name="columns.renderRowDetailsIcon" /> on a column makes the column display the row details expand icon.

The row details in the DataGrid can contain another DataGrid or any other custom content.
</Note>


<Sandpack title="Basic master detail DataGrid example" size="lg">

<Description>

This example shows a master DataGrid with cities & countries.

The details for each city shows a DataGrid with developers in that city.

</Description>

```ts file="master-detail-example.page.tsx"

```

</Sandpack>



---
title: Master Detail with custom row detail contents
description: Learn how to use master-detail to customise your row detail contents
---

The Infinite Table React DataGrid allows you to render any valid JSX nodes as row details.

You can render a DataGrid directly or you can nest the DataGrid at any level of nesting inside the row details.
Or you can simply choose to render anything else - no DataGrid required.

## Rendering a detail DataGrid

Your row detail content can include another Infinite Table DataGrid.

<Note>

The DataGrid you're rendering inside the row detail doesn't need to be the return value of the <PropLink name="rowDetailRenderer" /> function - it can be nested inside other valid JSX nodes you return from the function.

</Note>

<Sandpack title="Master detail with custom content & DataGrid" size="lg" viewMode="preview">

<Description>

In this example, the row detail contains custom content, along with another Infinite Table DataGrid. You can nest a child DataGrid inside the row details at any level of nesting.

</Description>

```ts file="master-detail-custom-datagrid-example.page.tsx"
```

</Sandpack>


<Note>

You'll probably want to configure the height of the row detail content. Use the <PropLink name="rowDetailHeight" /> prop to do that.

</Note>

## Multiple levels of nesting

The master-detail configuration for the DataGrid can contain any level of nesting.

The example below shows 3 levels of nesting - so a master DataGrid, a detail DataGrid and another third-level detail with custom content.

<Sandpack title="Master detail with 3 levels of nesting" size="lg" viewMode="preview">

<Description>

In this example, we have 3 levels of nesting:
 - The master DataGrid shows cities/countries
 - The first level of detail shows developers in each city
 - The second level of detail shows custom data about each developer

</Description>

```ts file="master-detail-3-levels-example.page.tsx"
```

</Sandpack>
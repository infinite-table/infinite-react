---
title: Infinite Table Row Details API
layout: API
---

This API can be used when [master-detail](/docs/learn/master-detail/overview) is configured in the DataGrid.

You can retrieve the row details api by reading it from the `api.rowDetailApi` property.

```tsx {4}

const onReady = ({api}: {api:InfiniteTableApi<DATA_TYPE>}) => {
  // do something with it
  api.rowDetailApi.collapseAllDetails()
}

<InfiniteTable<DATA_TYPE>
  columns={[...]}
  onReady={onReady}
/>
```

See the [Infinite Table API page](/docs/reference/api) for the main API.
See the [Infinite Table Cell Selection API page](/docs/reference/cell-selection-api) for the row selection API.
See the [Infinite Table Row Selection API page](/docs/reference/row-selection-api) for the row selection API.
See the [Infinite Table Column API page](/docs/reference/column-api) for the column API.

<PropTable sort searchPlaceholder="Type to filter API methods">

<Prop name="collapseAllDetails" type="() => void">

> Collapses all row details.

<Sandpack title="Master detail DataGrid with collapse all button" size="lg" viewMode="preview">

<Description>

Some of the rows in the master DataGrid are expanded by default.

You can collapse them via the Row Detail API.

</Description>

```ts file="$DOCS/learn/master-detail/master-detail-api-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="expandAllDetails" type="() => void">

> Expands all row details.

<Sandpack title="Master detail DataGrid with expand all button" size="lg" viewMode="preview">

<Description>

Click the `Expand All` button to expand all row details.

</Description>

```ts file="$DOCS/learn/master-detail/master-detail-api-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="isRowDetailCollapsed" type="(rowId: any)=> boolean">

> Checks if the row detail is collapsed for the row with the specified primary key.

</Prop>

<Prop name="isRowDetailExpanded" type="(rowId: any)=> boolean">

> Checks if the row detail is expanded for the row with the specified primary key.

</Prop>

<Prop name="collapseRowDetail" type="(rowId: any) => void">

> Collapses the detail for the row with the specified primary key.

</Prop>

<Prop name="expandRowDetail" type="(rowId: any)=> boolean">

> Expands the detail for the row with the specified primary key.

</Prop>

<Prop name="toggleRowDetail" type="(rowId: any)=> boolean">

> Toggles the expand/collapse state of the row detail, for the row with the specified primary key.

</Prop>

</PropTable>

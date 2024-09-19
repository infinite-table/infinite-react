---
title: Disabled Rows
---

Disabling rows allows you to have some rows that are not selectable, not clickable, not reacheable via keyboard navigation and other interactions.

The `DataSource` manages the disabled state of rows, via the <DPropLink name="defaultRowDisabledState" /> (uncontrolled) prop and <DPropLink name="rowDisabledState" /> (controlled) prop.

```tsx
<DataSource<DATA_TYPE>
  idProperty="id"
  data={[]}
  defaultRowDisabledState={{
    enabledRows: true,
    disabledRows: ['id1', 'id4', 'id5']
  }}
/>
  <InfiniteTable<DATA_TYPE>
    {/* ... */}
  />
</DataSource>
```

<Note>

In addition to using the <DPropLink name="defaultRowDisabledState" />/<DPropLink name="rowDisabledState" /> props, you can also specify the <DPropLink name="isRowDisabled" /> function prop, which overrides those other props and ultimately determines whether a row is disabled or not.

</Note>

<Sandpack title="Specify some rows as initially disabled">

```tsx file="initialRowDisabledState-example.page.tsx"
```

</Sandpack>

## Using disabled rows while rendering

When rendering a cell, you have access to the row disabled state - the <TypeLink name="InfiniteTableRowInfo" /> type has a `rowDisabled` property which is true if the row is disabled.

<Sandpack title="Using the row disabled state while rendering">

<Description>
  This example uses custom rendering for the `firstName` column to render an emoji for disabled rows.
</Description>

```tsx file="custom-rendering-for-disabled-rows-example.page.tsx"
```

</Sandpack>

## Using the API to enable/disable rows

You can use the `DataSourceApi` to enable or disable rows programmatically.

<DApiLink name="setRowEnabled" />

```tsx
dataSourceApi.setRowEnabled(rowId, enabled);

```

<DApiLink name="setRowEnabledAt" />

```tsx
dataSourceApi.setRowEnabledAt(rowIndex, enabled);
```

<Sandpack title="Using the API to enable/disable rows">

<Description>
Use the context menu on each row to toggle the disabled state of the respective row.
</Description>

```tsx file="using-api-to-disable-rows-example.page.tsx"
```

</Sandpack>
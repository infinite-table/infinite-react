---
title: Infinite Table API
layout: API
---

When rendering the `DataSource` component, you can get access to the API by getting it from the <DPropLink name="onReady" /> callback prop.

```tsx {3}
<DataSource<DATA_TYPE>
  
  onReady={(api: DataSourceApi<DATA_TYPE>) => {
    // api is accessible here
    // you may want to store a reference to it in a ref or somewhere in your app state
  }}
/>
```

You can also get it from the `InfiniteTable` <PropLink name="onReady" /> callback prop:


```tsx {4}
<InfiniteTable<DATA_TYPE>
  columns={[...]}
  onReady={(
    {api, dataSourceApi}: {
      api: InfiniteTableApi<DATA_TYPE>,
      dataSourceApi: DataSourceApi<DATAT_TYPE>
    }) => {

    // both api and dataSourceApi are accessible here
  }}
/>
```

For API on row/group selection, see the [Selection API page](./selection-api).


<PropTable>

<Prop name="getDataByPrimaryKey" type="(primaryKey: string | number) => DATA_TYPE | undefined">

> Retrieves the data object for the specified primary key.

</Prop>

</PropTable>

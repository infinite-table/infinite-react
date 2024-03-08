---
title: How to customise the DataGrid default sorting
author: admin
---

In this article, we'll show you how easy it is to configure the default sorting for the React DataGrid.

## Using the `defaultSort` prop on the DataSource

Sorting is configured on the DataGrid `<DataSource />` component. For this, you use the <PropLink name="defaultSortInfo" /> prop, as either an object, for sorting by a single column, or an array of objects, for sorting by multiple columns.

```tsx title="Specifying a default sort order"
// sort by country DESC and salary ASC
const defaultSortInfo={[
  { field: "country", dir: -1 },
  { field: "salary", dir: 1 },
]}

<DataSource defaultSortInfo={defaultSortInfo} />
```

That's it! Now, when the DataGrid is first rendered, it will be sorted by the `country` column in descending order, and then by the `salary` column in ascending order.

<Note>

For sorting to work properly for numeric columns, don't forget to specify `type: "number"` in the <PropLink name="columns.type" code={false}>column configuration</PropLink>.

</Note>

<CSEmbed id="default-sort-order-react-datagrid-54dzny" />

<Note>

When the <PropLink name="defaultSortInfo" /> is an array, the DataGrid will know you want to allow sorting by multiple columns.

See our page on [multiple sorting](/docs/learn/sorting/multiple-sorting) for more details.

</Note>

## Local vs remote sorting

The above example uses local sorting. If you don't explicitly specify a <PropLink name="sortMode" /> prop on the DataGrid, the sorting will be done locally, in the browser.

However, you can also have remote sorting - for this scenario, make sure you use <PropLink name="sortMode">sortMode="remote"</PropLink>.

<Note>

In this case, it's your responsability to send the `sortInfo` to your backend using the <DPropLink name="data" /> prop of the DataSource - your `data` function will be called by the DataGrid whenever sorting changes. The arguments the function is called with will include the sort information (along with other details like filtering, grouping, aggregations, etc).

```tsx
const dataSource: DataSourceData<Developer> = ({ sortInfo }) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }
  const args = [
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');

  return fetch('https://your-backend.com/fetch-data?' + args)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};
```

</Note>

<CSEmbed id="vigilant-lena-shs2td" title="Remote sorting example"/>

## Responding to sorting changes

When the user changes the sorting in the React DataGrid UI, the DataSource <DPropLink name="data" /> function is called for you, with the new sort information.

However, you might want to respond in other ways - for this, you can use <DPropLink name="onSortInfoChange "/> callback prop.

<Note>

If you use the controlled <DPropLink name="sortInfo" /> instead of the uncontrolled <DPropLink name="defaultSortInfo" />, you will need to configure the <DPropLink name="onSortInfoChange" /> callback to respond to sorting changes and update the UI.

</Note>

## Using the column sort info for rendering

At runtime, you have access to the column sort information, both in the column header - see <PropLink name="columns.renderHeader" /> and in the column cells - see <PropLink name="columns.renderValue" />.

<CSEmbed id="heuristic-butterfly-v5k6v7" title="Customising the column header depending on the sort info"/>

For example, you can customise the icon that is displayed in the column header to indicate the sort direction.

Via the <PropLink name="columns.renderHeader" /> you have full access to how the column header is rendered and can use the sorting/filtering/grouping/aggregation/pivoting information of that column to customise the rendering.

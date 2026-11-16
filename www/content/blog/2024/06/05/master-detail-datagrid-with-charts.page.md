---
title: Master Detail React DataGrid with Charts
author: admin
date: 2024-06-05
tags: master-detail
---
In this demo, we show you how easy it is to leverage the master-detail support in our React DataGrid in order to toggle between a table and a chart view in the row detail.


<CSEmbed id="master-detail-with-charts-gg7h4f" code={false} size="lg" title="It's very easy to change between an InfiniteTable or a chart in the row detail"/>

In the <PropLink name="components.RowDetail" code={false}>RowDetail</PropLink> component, we render a `<DataSource />`, which in turn will render either an `<InfiniteTable />` component or a chart.

The `<DataSource />` in InfiniteTable is very powerful and does all the data processing the grid needs. All the row grouping, sorting, filtering, aggregations, pivoting are done in the `<DataSource />` - so you can use it standalone, or with InfiniteTable - it's totally up to you.

In practice, this means that you can use the `<DataSource />` to process your data and then simply pass that to a charting library like `ag-charts-react`.

```tsx file="master-detail-datagrid-with-charts.snippet.tsx" region="intro"
```

The demo above is using the `ag-charts-react` package to render the charts.

<Note>

Read more about the [rendering custom content in a master-detail setup](/docs/learn/master-detail/custom-row-detail-content).

</Note>



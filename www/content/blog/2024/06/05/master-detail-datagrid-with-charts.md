---
title: Master Detail React DataGrid with Charts
author: admin
---
In this demo, we show you how easy it is to leverage the master-detail support in our React DataGrid in order to toggle between a table and a chart view in the row detail.


<CSEmbed id="master-detail-with-charts-gg7h4f" code={false} size="lg" title="It's very easy to change between an InfiniteTable or a chart in the row detail"/>

In the <PropLink name="columns.components.RowDetail" code={false}>RowDetail</PropLink> component, we render a `<DataSource />`, which in turn will render either an `<InfiniteTable />` component or a chart.

The `<DataSource />` in InfiniteTable is very powerful and does all the data processing the grid needs. All the row grouping, sorting, filtering, aggregations, pivoting are done in the `<DataSource />` - so you can use it standalone, or with InfiniteTable - it's totally up to you.

In practice, this means that you can use the `<DataSource />` to process your data and then simply pass that to a charting library like `ag-charts-react`.

```tsx
const detailGroupBy: DataSourcePropGroupBy<Developer> = [{ field: "stack" }];
const detailAggregationReducers: DataSourcePropAggregationReducers<Developer> =
  {
    salary: {
      field: "salary",
      initialValue: 0,
      reducer: (acc, value) => acc + value,
      done: (value, arr) => Math.round(arr.length ? value / arr.length : 0),
    },
  };

function RowDetail() {
  const rowInfo = useMasterRowInfo<City>()!;
  const [showChart, setShowChart] = React.useState(rowInfo.id % 2 == 1);

  return (
    <div style={{...}}>
      <button onClick={() => setShowChart((showChart) => !showChart)}>
        Click to see {showChart ? "grid" : "chart"}
      </button>

      {/**
       * In this example, we leverage the DataSource aggregation and grouping feature to
       * calculate the average salary by stack for the selected city.
       */}
      <DataSource<Developer>
        data={detailDataSource}
        primaryKey="id"
        groupBy={detailGroupBy}
        aggregationReducers={detailAggregationReducers}
      >
        {/**
         * Notice here we're not rendering an InfiniteTable component
         * but rather we use a render function to access the aggregated data.
         */}
        {(params) => {
          // here we decide if we need to show the chart or the grid
          if (!showChart) {
            return (
              <InfiniteTable
                columns={detailColumns}
                domProps={{
                  style: { paddingTop: 30 },
                }}
              />
            );
          }

          // the dataArray has all the aggregations and groupings done for us, 
          // so we need to retrieve the correct rows and pass it to the charting library
          const groups = params.dataArray.filter((rowInfo) => rowInfo.isGroupRow);
          const groupData = groups.map((group) => ({ stack: group.data?.stack, avgSalary: group.reducerData?.salary }));

          return (
            <AgChartsReact
              options={{
                autoSize: true,
                title: {
                  text: `Avg salary by stack in ${rowInfo.data?.name}, ${rowInfo.data?.country}`,
                },
                data: groupData,
                series: [
                  {
                    type: "bar",
                    xKey: "stack",
                    yKey: "avgSalary",
                    yName: "Average Salary",
                  },
                ],
              }}
            />
          );
        }}
      </DataSource>
    </div>
  );
}
```

The demo above is using the `ag-charts-react` package to render the charts.

<Note>

Read more about the [rendering custom content in a master-detail setup](/docs/learn/master-detail/custom-row-detail-content).

</Note>



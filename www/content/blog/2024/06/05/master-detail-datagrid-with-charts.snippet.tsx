// Snippets shown on master-detail-datagrid-with-charts.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  DataSourcePropAggregationReducers,
  DataSourcePropGroupBy,
  InfiniteTable,
  useMasterRowInfo,
} from '@infinite-table/infinite-react';

{
  //#region intro
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
  //#endregion
}

export {};

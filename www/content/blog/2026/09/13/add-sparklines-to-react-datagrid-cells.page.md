---
title: Add sparklines to React DataGrid cells
description: Use Infinite Table column.renderValue to turn arrays of values into compact trend charts directly inside DataGrid cells.
date: 2026-09-13
author: radu
tags: sparklines, column-rendering, react-datagrid
---

Numbers are useful, but they are not always enough.

A support table can show how many bugs a team fixed this week. A sales grid can
show the latest revenue number for each region. An infrastructure dashboard can
show the current error rate for every service. Those values matter, but the trend
behind them often matters more: is the row stable, improving, or drifting in the
wrong direction?

That is where sparklines work well. They keep the table compact while giving each
row a tiny time-series chart.

Infinite Table does not need a special sparkline API for this. The feature that
unlocks it is <PropLink name="columns.renderValue" />: every cell can render a
React component, so a column value can be passed straight into the charting
library you already use.

The docs have a [sparklines example](/docs/learn/examples/using-sparklines) that
uses [`react-sparklines`](https://www.npmjs.com/package/react-sparklines). This
article walks through the pattern.

## Start with values that already describe a trend

In the example, every employee row gets a `bugFixes` array. The grid still
receives normal row objects; one field simply contains the data points that will
feed the sparkline.

```ts
type Employee = {
  id: number;
  firstName: string;
  department: string;
  bugFixes: number[];
};
```

That shape is enough for the column. The field can come from your API, from a
derived selector, or from a client-side transformation before the rows reach
<DataSourcePropLink name="data" />.

```ts
const dataSource = () => {
  return fetch('/employees10k')
    .then((r) => r.json())
    .then((data: Employee[]) => {
      return data.map((employee) => ({
        ...employee,
        bugFixes: [...Array(10)].map(() => Math.round(Math.random() * 100)),
      }));
    });
};
```

Real applications usually replace the random values with a short history from
the backend: last 7 days of incidents, last 12 months of revenue, last 30 samples
from a sensor, or any other sequence that makes sense next to the row.

## Render the chart from the column

The sparkline column is a regular Infinite Table column. It has a `field`, a
`header`, a width, and a <PropLink name="columns.renderValue" /> function.

```tsx {5-22}
import { Sparklines, SparklinesLine } from 'react-sparklines';

const columns = {
  bugFixes: {
    field: 'bugFixes',
    header: 'Bug Fixes',
    defaultWidth: 300,
    renderValue: ({ value, data }) => {
      const color =
        data?.department === 'IT' || data?.department === 'Management'
          ? 'tomato'
          : '#253e56';

      return (
        <Sparklines data={value} style={{ width: '100%' }} height={30}>
          <SparklinesLine color={color} />
        </Sparklines>
      );
    },
  },
};
```

The important part is that `value` is the cell value for the column field. In
this case, that value is a `number[]`, so it can be passed to
`<Sparklines data={value} />`.

The renderer also receives `data`, the full row object. That lets you make the
visual treatment row-aware. In the docs example, IT and Management rows use a red
line while other departments use the default blue. The same idea works for
thresholds, risk levels, service tiers, or anything else in the row.

## Keep the chart inside the cell

Small charts need predictable space. The example gives the column a wider
`defaultWidth` and makes the chart fill the cell width.

```tsx
bugFixes: {
  field: 'bugFixes',
  header: 'Bug Fixes',
  defaultWidth: 300,
  renderValue: ({ value }) => {
    return (
      <Sparklines data={value} style={{ width: '100%' }} height={30}>
        <SparklinesLine color="#253e56" />
      </Sparklines>
    );
  },
}
```

That keeps layout decisions in the column definition:

- the DataGrid still controls column sizing and virtualization
- the chart component only draws inside the cell it receives
- resizing the column gives the sparkline more or less horizontal room

If the column is optional, it can also participate in the rest of the column
system: column menus, grouping, pinning, hiding, or custom headers can still be
configured the same way as any other column.

## Try the full example

The live demo below is the same example used in the docs. It loads 10k employee
rows and renders a sparkline for the `bugFixes` column.

<Sandpack
size="md"
viewMode="preview"
deps="react-sparklines"
title="Sparklines in DataGrid cells"

>

<Description>

The `bugFixes` column renders a compact chart from an array value. The line color
is based on the row's `department` field.

</Description>

```tsx live file="$DOCS/learn/examples/using-sparklines-example.page.tsx"

```

</Sandpack>

## When sparklines are worth it

Sparklines are a good fit when each row has a small sequence attached to it and
the shape of that sequence is more useful than a single final value.

Use them for:

- trend columns in monitoring and observability dashboards
- per-region sales, revenue, or inventory movement
- recent activity for accounts, projects, or queues
- small histories beside ranking, health, or score columns
- comparisons where users scan many rows before opening a detail view

Avoid them when the chart becomes the whole task. If users need axes, legends,
tooltips, brushing, zooming, or deep comparison between series, render a larger
chart in a row detail panel or a dedicated screen. A sparkline should answer the
quick scanning question first.

## The broader pattern

The point of the example is not the specific chart library. It is that
<PropLink name="columns.renderValue" /> gives cell rendering to your React code.

If a cell value can be represented as a React component, it can live in a column:
sparklines, status pills, avatars, progress bars, inline actions, or a small
composition of all of them. Infinite Table handles the DataGrid behavior around
the cell; your renderer handles the piece of UI that makes the row easier to
understand.

Start with the [sparklines example](/docs/learn/examples/using-sparklines), then
open the <PropLink name="columns.renderValue" /> docs when you want to adapt the
same pattern to your own cells.

---
title: Sparklines Example
---
This example shows how to use integrate a sparkline component in a DataGrid column.

For this demo, we're using the [`react-sparklines`](https://www.npmjs.com/package/react-sparklines)  library.

The most important part is the <PropLink name="columns.renderValue" /> property, which allows you to render a custom React component for the cell value.

```tsx {11-23} title="Using column.renderValue to render a sparkline"
const columns = {
  // ... other columns
  id: {
    field: 'id',
    defaultWidth: 100,
  },
  bugFixes: {
    field: 'bugFixes',
    header: 'Bug Fixes',
    defaultWidth: 300,
    renderValue: ({ value }) => {
      return (
        <Sparklines
          data={value}
          style={{
            width: '100%',
          }}
          height={30}
        >
          <SparklinesLine color="#253e56" />
        </Sparklines>
      );
    },
  },
}
```


<Sandpack size="md" viewMode="preview" deps="react-sparklines" title="Using a sparkline component">

```tsx file="./using-sparklines-example.page.tsx"

```

</Sandpack>

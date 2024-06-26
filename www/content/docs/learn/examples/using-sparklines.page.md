---
title: Sparklines Example
---
This example shows how to use integrate a sparkline component in a DataGrid column.

For this demo, we're using the [`react-sparklines`](https://www.npmjs.com/package/react-sparklines)  library.

The most important part is the <PropLink name="columns.renderValue" /> property, which allows you to render a custom React component for the cell value.

```tsx {11-26} title="Using column.renderValue to render a sparkline"
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
    renderValue: ({ value, data }) => {
      const color =
        data?.department === 'IT' || data?.department === 'Management'
          ? 'tomato'
          : '#253e56';
      return (
        <Sparklines
          data={value}
          style={{
            width: '100%',
          }}
          height={30}
        >
          <SparklinesLine color={color} />
        </Sparklines>
      );
    },
  },
}
```


<Sandpack size="md" viewMode="preview" deps="react-sparklines" title="Using a sparkline component">

<Description>
This demo renders a sparkline and changes the color of the sparkline based on the `department` field in the row (red for IT or Management, blue for everything else).
</Description>

```tsx file="./using-sparklines-example.page.tsx"

```

</Sandpack>

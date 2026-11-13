---
title: Sparklines Example
---
This example shows how to use integrate a sparkline component in a DataGrid column.

For this demo, we're using the [`react-sparklines`](https://www.npmjs.com/package/react-sparklines)  library.

The most important part is the <PropLink name="columns.renderValue" /> property, which allows you to render a custom React component for the cell value.

```tsx file="using-sparklines.snippet.tsx" region="using-column-rendervalue-to-render-a-sparkline" title="Using column.renderValue to render a sparkline"
```


<DemoDescription>

This demo renders a sparkline and changes the color of the sparkline based on the `department` field in the row (red for IT or Management, blue for everything else).

</DemoDescription>

```tsx file="using-sparklines-example.demo.tsx" title="Using a sparkline component"
```

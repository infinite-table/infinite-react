---
title: Styling Rows
vue: true
angular: true
---

Rows can be styled by using the `rowStyle` and the `rowClassName` props

- the <PropLink name="rowStyle" /> prop can be a style `object` or a `function` that returns a style `object` or `undefined`
- the <PropLink name="rowClassName"/> prop can be a `string` (the name of a CSS class) or a `function` that returns a `string` or `undefined`

```tsx file="styling-rows.snippet.tsx" region="defining-a-rowstyle-function" title="Defining-a-rowStyle-function" neutral
```

<Note>

The <PropLink name="rowClassName" /> function prop has the same signature as the <PropLink name="rowStyle" /> function prop.

</Note>

<FrameworkContent framework="angular">

<Note>

The rows are rendered by the grid, not by the template of your component, so the styles of your component - which Angular scopes to its own template - don't reach them. Define the classes you return from <PropLink name="rowClassName" /> in a global stylesheet (`src/styles.css`), or in a component with `encapsulation: ViewEncapsulation.None`.

</Note>

</FrameworkContent>

## Row styling example

```tsx file="/docs/reference/rowStyle-example.demo.tsx"
```

<Note>

In the <PropLink name="rowStyle" /> function, you can access the rowInfo object, which contains information about the current row. It's especially useful when you have grouping and aggregation, as it contains the aggregation values and other extra info.

</Note>

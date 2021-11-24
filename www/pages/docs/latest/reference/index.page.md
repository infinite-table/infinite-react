---
title: Infinite Table Reference
layout: API
---

<PropTable>

<Prop name="className" type="string">

> CSS class name to be applied to the component root element.

For applying a className when the component is focused, see <PropLink name="focusedClassName" />

For applying a className when the focus is within the component, see <PropLink name="focusedWithinClassName" />

</Prop>

<Prop name="columns">

> Describes the columns available in the component - MORE DOCS COMING.

</Prop>

<Prop name="focusedClassName" type="string">

> CSS class name to be applied to the component root element when it has focus.

For applying a className when the focus is within the component, see <PropLink name="focusedWithinClassName" />

For focus style, see <PropLink name="focusedStyle" />.


<Sandpack title="focusedClassName example">

```ts file=focusedClassName-example.page.tsx
```
```ts file=data.ts
```
</Sandpack>

</Prop>


<Prop name="focusedWithinClassName" type="string">

> CSS class name to be applied to the component root element when there is focus within (inside) the component.

For applying a className when the component root element is focused, see <PropLink name="focusedClassName" />


</Prop>

<Prop name="rowHeight" type="number|string" defaultValue={40}>

> Specifies the height for rows. If a string is passed, it should be the name of a CSS variable, eg `--row-height`

<Sandpack title="rowHeight as number">

```ts file=rowHeight-number-example.page.tsx
```
```ts file=data.ts
```
</Sandpack>

<Sandpack title="rowHeight from CSS variable name">

```ts file=rowHeight-cssvar-example.page.tsx
```
```ts file=data.ts
```
</Sandpack>


</Prop>


<Prop name="rowStyle">

> The `rowStyle` prop can be either an object (typed as `React.CSSProperties`) or a function

### rowStyle as a function 

<APIAnatomy>

<AnatomyStep title="data can be null">

When Infinite Table will call `rowStyle`, the `data` property can be null - this is the case for grouped rows.

</AnatomyStep>

<AnatomyStep title="return a style object or undefined">

You can either return a valid style object, or undefined.

</AnatomyStep>


```tsx  [[1, 4, "data: Employee | null;"], [2,9,"{ background: 'tomato' };"]]
const rowStyle: InfiniteTablePropRowStyle<Employee> = ({
  data,
}: {
  data: Employee | null;
}) => {
  const salary = data ? data.salary : 0;

  if (salary > 150_000) {
    return { background: 'tomato' };
  }
};
```
</APIAnatomy>
</Prop>

</PropTable> 


---
title: Column Groups
description: Columns can be grouped with multiple levels of nesting thus making Infinite Table DataGrid a powerful tool for data analysts
---

Specify column groups via the controlled <PropLink name="columnGroups" /> (or uncontrolled <PropLink name="defaultColumnGroups"/>) prop.

The value is an object, with keys being the group id and value being the group description.

```tsx file="column-grouping.snippet.tsx" region="defining-column-groups" title="defining-column-groups"
```

A column group can have a parent column group, specified by the <PropLink name="columnGroups.columnGroup" /> property. The same goes for a column - columns can have <PropLink name="columns.columnGroup">columnGroup</PropLink> as well.

```tsx file="column-grouping.snippet.tsx" region="defining-columns-with-groups" title="defining-columns-with-groups"
```

## Column groups in action

```tsx file="column-groups-example.demo.tsx"
```

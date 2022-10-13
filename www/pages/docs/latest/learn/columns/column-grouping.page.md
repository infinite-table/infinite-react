---
title: Column Groups
description: Columns can be grouped with multiple levels of nesting thus making Infinite Table DataGrid a powerful tool for data analysts
---

Specify column groups via the controlled `columnGroups` (or uncontrolled `defaultColumnGroups`) prop.

The value is a `Map`, with keys being the group id and value being the group description.

```tsx title=defining-column-groups
const columnGroups: Map<string, InfiniteTableColumnGroup> = new Map([
  ['contact info', { header: 'Contact info' }],
  // `street` column group belongs to the `address` columnGroup
  ['street', { header: 'street', columnGroup: 'address' }],
  ['location', { header: 'location', columnGroup: 'address' }],

  // this is a top-level group
  ['address', { header: 'Address' }],
]);
```

A column group can have a parent column group, specified by the `columnGroup` property. The same goes for a column - columns can have `columnGroup` as well.

```tsx title=defining-columns-with-groups
const columns = new Map<string, InfiniteTableColumn<Person>>([
  ['id', { field: 'id' }],

  // `streetNo` column belongs to the `street` columnGroup
  ['streetNo', { field: 'streetNo', columnGroup: 'street' }],
  ['city', { field: 'city', columnGroup: 'location' }],

  ['streetName', { field: 'streetName', columnGroup: 'street' }],
  ['firstName', { field: 'firstName' }],

  ['country', { field: 'country', columnGroup: 'location' }],
  ['region', { field: 'region', columnGroup: 'location' }],

  ['email', { field: 'email', columnGroup: 'contact info' }],
  ['phone', { field: 'phone', columnGroup: 'contact info' }],
]);
```

## Column groups in action

<Sandpack>

```tsx file=column-groups-example.page.tsx

```

```tsx file=column-groups-data.ts

```

</Sandpack>

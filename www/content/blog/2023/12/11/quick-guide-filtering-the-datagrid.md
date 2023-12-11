---
title: Quick Guide - Filtering the DataGrid
author: admin
draft: true
---

This is the first article in a series of quick guides that will help you get started with the DataGrid, each focusing on a specific feature. In this article, we will learn how to use filtering in the DataGrid.


### Applying Filters on the DataSource

You apply filters on the `DataSource` component

```tsx {4-11} title="Specifying an initial filter value for the DataSource"
<DataSource<Developer>
  data={...}
  primaryKey="id"
  defaultFilterValue={[
    field: 'salary',
    filter: {
      operator: 'gt',
      value: 50000,
      type: 'number',
    },
  ]}
/>
```

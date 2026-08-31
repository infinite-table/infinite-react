---
title: Build readable React DataGrids with column groups
description: Use Infinite Table column groups to turn wide React DataGrids into nested, declarative headers that match how users scan related fields.
date: 2026-08-31
author: radu
tags: column-groups, columns, react-datagrid
---

Wide DataGrids can become hard to scan even when every individual column is useful. A customer record might include names, email, phone, street, city, country, region, account owner, plan, usage, and billing fields. The data is related, but a flat header row makes users do the grouping work in their heads.

Infinite Table's [Column Groups docs](/docs/learn/columns/column-grouping) show a small API for solving that problem: define the groups once, then assign columns to them. The result is a DataGrid header that communicates structure before the user reads a single cell.

## Start with the way people read the grid

Column groups are a good fit when the horizontal layout already has natural sections:

- Contact information: email, phone, preferred channel
- Address information: street number, street name, city, country, region
- Finance information: currency, salary, budget, invoice total
- Product metrics: usage, seats, health score, renewal date

Instead of relying only on column order, use a group header to make those sections visible.

In Infinite Table, group definitions live in <PropLink name="columnGroups" /> for controlled usage, or <PropLink name="defaultColumnGroups" /> when the initial group model is enough. The object keys are group ids, and each value describes that group.

```tsx title="Defining column groups"
const columnGroups: Record<string, InfiniteTableColumnGroup> = {
  'contact info': { header: 'Contact info' },
  address: { header: 'Address' },
  street: { header: 'Street', columnGroup: 'address' },
  location: { header: 'Location', columnGroup: 'address' },
};
```

The `contact info` and `address` groups are top-level groups. The `street` and `location` groups are nested under `address` by using <PropLink name="columnGroups.columnGroup" />.

## Attach columns to groups

After declaring the groups, assign each column with <PropLink name="columns.columnGroup" />.

```tsx title="Assigning columns to groups"
const columns: Record<string, InfiniteTableColumn<Person>> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },

  email: { field: 'email', columnGroup: 'contact info' },
  phone: { field: 'phone', columnGroup: 'contact info' },

  streetNo: { field: 'streetNo', columnGroup: 'street' },
  streetName: { field: 'streetName', columnGroup: 'street' },

  city: { field: 'city', columnGroup: 'location' },
  country: { field: 'country', columnGroup: 'location' },
  region: { field: 'region', columnGroup: 'location' },
};
```

Columns without a `columnGroup` still render normally. That is useful for identifiers, status fields, or action columns that should stay outside a grouped header area.

## See column groups in action

The docs example below groups contact fields and address fields, with `street` and `location` nested under a parent `Address` group.

<Sandpack title="Column groups in a React DataGrid" size="md" viewMode="preview">

<Description>

This example is reused from the Column Groups docs. Notice how the header communicates the shape of the record before you inspect the cells.

</Description>

```tsx live file="$DOCS/learn/columns/column-groups-example.page.tsx"

```

</Sandpack>

## Keep the structure declarative

The important part is that grouping is part of the column model, not a separate header layout you maintain by hand.

```tsx {2,4}
<InfiniteTable<Person>
  columnGroups={columnGroups}
  columns={columns}
/>
```

That keeps the setup easy to reason about:

- Rename a group by changing its `header`
- Move a column by changing its `columnGroup`
- Nest groups by pointing one group at another group id
- Leave ungrouped columns alone

For teams building configurable tables, that declarative shape matters. You can derive `columns` and `columnGroups` from product configuration, user preferences, or saved views, then pass the result into `<InfiniteTable />`.

## Design tips for grouped headers

A few practical rules help column groups stay useful:

### Group by user task, not database table

Users usually do not care that `streetNo`, `streetName`, `city`, `country`, and `region` came from the same API payload. They care that those fields describe an address. Use group labels that match what the person is trying to understand.

### Keep top-level groups broad

Top-level groups are most helpful when they divide the grid into a small number of sections. If every two columns become a separate top-level group, the header can become noisy again. Prefer broader labels like `Contact info`, `Address`, `Billing`, or `Usage`.

### Use nested groups when the section is still wide

Nested groups are useful when a section needs another layer of meaning. In the docs example, `Address` is split into `Street` and `Location`, so the user can scan both the broad category and the more specific category.

### Leave standalone columns standalone

Not every column needs a group. Primary keys, names, status badges, and action columns often read better outside grouped sections.

## When column groups are a good fit

Reach for column groups when a DataGrid has enough horizontal information that users need a map:

- CRM and admin tables with contact, account, and billing fields
- HR dashboards with personal, compensation, team, and location fields
- Operations grids with asset, status, route, and schedule fields
- Analytics grids where dimensions and measures share the same row
- Internal tools with configurable or role-specific column sets

The feature is intentionally small: define `columnGroups`, attach columns with `columnGroup`, and let the DataGrid render the header hierarchy. That is often enough to turn a wide table from a list of fields into a readable workspace.

Start with the [Column Groups docs](/docs/learn/columns/column-grouping), then adapt the group labels to the way your users talk about the data.

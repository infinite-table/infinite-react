---
title: Reuse column configuration with Column Types in your React DataGrid
description: Use Infinite Table Column Types to share widths, formatting, editors, styling, and default behavior across many DataGrid columns.
date: 2026-08-04
author: radu
tags: columns, configuration, editing
---

The first version of a DataGrid column model is usually straightforward: define a field, give it a header, maybe add a formatter.

Then the product grows. Three money columns need the same alignment and number formatting. Two date columns need the same editor. Most columns should flex, but ID columns should stay compact. Status columns need the same styling everywhere they appear.

You can copy those options from column to column, but duplicated column config gets hard to audit. Infinite Table's [Column Types](/docs/learn/columns/column-types) feature gives you a better place for that shared behavior.

## Column Types are reusable column blueprints

A column type is a named set of column properties. You define those shared properties once in <PropLink name="columnTypes" />, then opt columns into them through <PropLink name="columns.type" />.

```tsx
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const columnTypes = {
  default: {
    minWidth: 140,
    defaultFlex: 1,
  },
  money: {
    align: 'end',
    renderValue: ({ value }) => currencyFormatter.format(value),
  },
  compact: {
    defaultWidth: 90,
    defaultFlex: 0,
  },
};

const columns = {
  id: {
    field: 'id',
    type: ['default', 'compact'],
  },
  revenue: {
    field: 'revenue',
    type: ['default', 'money'],
  },
  margin: {
    field: 'margin',
    type: ['default', 'money'],
    header: 'Gross margin',
  },
};

<InfiniteTable columnTypes={columnTypes} columns={columns} />;
```

That keeps the column list focused on what each column represents, while the repeated behavior lives in a small dictionary.

## Use the `default` type for table-wide column policy

There is one special convention that makes Column Types especially useful: when a column does not specify a `type`, Infinite Table applies the `default` type.

```tsx
const columnTypes = {
  default: {
    minWidth: 160,
    defaultFlex: 1,
  },
};

const columns = {
  firstName: { field: 'firstName' },
  country: { field: 'country' },
  id: {
    field: 'id',
    type: null,
    defaultWidth: 80,
  },
};
```

In this setup, `firstName` and `country` inherit the default sizing policy. The `id` column opts out and provides its own width.

This is a good fit for app-level decisions:

- all regular columns should have a minimum readable width
- text columns should flex into available space
- most columns should share header styling
- most columns should be sortable or non-sortable by default

When one column needs to be different, define the prop directly on that column. Column props override props inherited from a type.

## Compose small types for product-specific behavior

Column types can also be an array:

```tsx
const columns = {
  salary: {
    field: 'salary',
    type: ['default', 'number', 'currency'],
  },
};
```

Infinite Table applies those types left-to-right, with later types overriding earlier ones for the same property. That makes it practical to keep types small:

- `default` for general sizing and table policy
- `number` for alignment and numeric formatting
- `currency` for money-specific rendering
- `editableDate` for date editors and date formatting
- `status` for labels, colors, and compact width

One detail from the docs is worth remembering: rendering functions are not piped through each type. If both `number` and `currency` define `renderValue`, only the later one wins. Treat type composition like object merging, not middleware.

## Share editors and rendering across fields

Column Types are not just for widths. They can carry styling, rendering, editor components, and edit behavior.

That is useful when several columns have the same data shape. For example, `birthDate` and `dateHired` can use the same date editor, the same display format, and the same edit-mode padding rules.

<Sandpack title="Column Types with a shared date editor" size="md" viewMode="preview">

<Description>

Both date columns opt into the same `date` column type, so they share the editor, width, edit styling, and formatted rendering. See the docs on [configuring editors for Column Types](/docs/learn/editing/column-editors#configure-editors-for-column-types).

</Description>

```tsx live file="$DOCS/learn/editing/column-types-date-editor-example.page.tsx"

```

</Sandpack>

For larger apps, this pattern helps keep domain decisions consistent:

- date columns open the same picker
- currency columns use the same locale and precision
- percentage columns render with the same suffix
- enum/status columns map raw values to the same labels
- editable columns share validation and editor components

Instead of asking every feature team to remember the full column configuration, give them a small vocabulary of approved column types.

## A practical way to introduce Column Types

If you already have a large column model, you do not need to rewrite it all at once. Start with repeated props that are easy to verify.

1. Move table-wide sizing into the `default` type.
2. Extract formatting for repeated data shapes like currency, dates, and percentages.
3. Move shared editors into types once the display config is stable.
4. Keep one-off business labels and exceptions directly on the column.
5. Use type arrays when a column genuinely belongs to more than one category.

The payoff is not just fewer lines of code. It is a clearer contract: columns describe data, Column Types describe reusable behavior.

Start with the [Column Types docs](/docs/learn/columns/column-types), then look for the first place in your grid where three columns are repeating the same config.

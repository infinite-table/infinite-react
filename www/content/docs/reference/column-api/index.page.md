---
title: Infinite Table Column API
layout: API
---

When rendering the `InfiniteTable` component, you can get access to the Column API through various column render props (for example, the <PropLink name="columns.header" /> render prop).

For the root API see the [API page](/docs/reference/api).
See the [Infinite Table Keyboard Navigation API page](/docs/reference/keyboard-navigation-api) for the keyboard navigation API.
For API on row/group selection, see the [Selection API page](/docs/reference/selection-api).
See the [Infinite Table Row Selection API page](/docs/reference/row-selection-api) for the row selection API.
See the [Infinite Table Row Detail API page](/docs/reference/row-detail-api) for the row detail API (when master-detail is configured).

<PropTable searchPlaceholder="Type to filter API methods" sort>

<Prop name="clearSort">

> Clears the sorting for the current column.

See related <PropLink name="setSort" /> prop.

Calling this will trigger <DPropLink name="onSortInfoChange" />

</Prop>

<Prop name="hideContextMenu" type="() => void">

> Hides the column context menu, if visible.

For showing the menu, see <PropLink name="showContextMenu"/>. To toggle the menu, see <PropLink name="toggleContextMenu"/>.

</Prop>

<Prop name="setSort" type="(sortDir: 1|-1|null) => void">

> Sets the sort direction for the current column.

To clear the sort, pass `null` as the argument. See related <PropLink name="clearSort"/>

Calling this will trigger <DPropLink name="onSortInfoChange" />.

</Prop>

<Prop name="toggleSort" type="(options?) => void">

> Toggles the sorting for the current column. Aliased to <ApiLink name="toggleSortingForColumn" />.

This is the same method the component uses internally when the user clicks a column header.

If the column is not sorted, it gets sorted in ascending order.

If the column is sorted in ascending order, it gets sorted in descending order.

If the column is sorted in descending order, the sorting is cleared.

<Note>

The `options` is optional and can have the `multiSortBehavior` property, which can be either `append` or `replace`. See related <PropLink name="multiSortBehavior" /> prop. If not provided, the default behavior is used.

</Note>

See related <ColumnApiLink name="setSort" /> and <ColumnApiLink name="getSortingForColumn" />.

</Prop>

<Prop name="setSort" type="(dir: 1|-1|null) => void">

> Sets the sorting for the current column. Aliased to <ApiLink name="setSortingForColumn" />.

The sort direction is specified by the `dir` parameter, which can be:

- `1` for ascending
- `-1` for descending
- `null` for clearing the sorting.

See related <ColumnApiLink name="toggleSort" /> and <ColumnApiLink name="getSortDir" />.

</Prop>

<Prop name="getSortDir" type="()=> 1|-1|null">

> Returns the sorting currently applied to the current column. Aliased to <ApiLink name="getSortingForColumn" />.

The return value is:

- `1` for ascending
- `-1` for descending
- `null` for no sorting.

See related <ColumnApiLink name="toggleSortingForColumn" /> and <ColumnApiLink name="setSortingForColumn" />.

</Prop>

<Prop name="clearSort" type="() => void">

> Clears the sorting for the current column.

It is the same as calling <ColumnApiLink name="setSort" /> with `null` as the argument.

</Prop>

<Prop name="isSortable" type="()=> boolean">

> Returns whether the current column is sortable.

See related <PropLink name="columnDefaultSortable" />, <PropLink name="columns.defaultSortable" />, <PropLink name="columnTypes.defaultSortable" /> and <PropLink name="sortable" />

</Prop>

<Prop name="showContextMenu" type="() => void">

> Shows the column context menu, if not already visible.

For hiding the menu, see <PropLink name="hideContextMenu"/>. To toggle the menu, see <PropLink name="toggleContextMenu"/>.

</Prop>

<Prop name="toggleContextMenu" type="() => void">

> Toggles the column context menu.

For showing the menu, see <PropLink name="showContextMenu"/>. For hiding the menu, see <PropLink name="hideContextMenu"/>.

<Sandpack title="Custom header with button to trigger the column context menu using the Column API">

<Description>

The `preferredLanguage` column has a custom header that shows a button for triggering the column context menu using the Column API.

</Description>

```ts file="$DOCS/reference/getColumnMenuItems-example.page.tsx"

```

</Sandpack>

</Prop>

</PropTable>

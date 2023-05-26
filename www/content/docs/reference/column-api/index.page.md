---
title: Infinite Table Column API
layout: API
---

When rendering the `InfiniteTable` component, you can get access to the Column API through various column render props (for example, the <PropLink name="columns.header" /> render prop).

For the root API see the [API page](/docs/reference/api).
For API on row/group selection, see the [Selection API page](/docs/reference/selection-api).

<PropTable searchPlaceholder="Type to filter API methods">


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

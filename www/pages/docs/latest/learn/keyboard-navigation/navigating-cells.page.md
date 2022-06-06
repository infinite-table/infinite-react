---
title: Keyboard Navigation for Cells
---

By default, <PropLink name="keyboardNavigation" code={false}>keyboard navigation</PropLink> for cells is enabled in Infinite Table. When a cell is clicked, it shows a highlight that indicates it is the currently active cell. From that point onwards, the user can use the keyboard to navigate the table cells.


<Sandpack>

<Description>

Click on a cell in the table and use the arrow keys to navigate around.

</Description>

```ts file=navigating-cells-initial-example.page.tsx
```
</Sandpack>

<Note>

* Use `ArrowUp` and `ArrowDown` to navigate to the previous and next cells vertically.
* Use `ArrowLeft` and `ArrowRight` to navigate to the previous and next cells horizontally.
* Use `PageUp` and `PageDown` to navigate the cells vertically by pages (a page is considered equal to the visible row count).
* Use `Shift+PageUp` and `Shift+PageDown` to navigate the cells horizontally by pages (a page is considered equal to the visible column count).
* Use `Home` and `End` to navigate vertically to the cell above (that's on the first row) and the cell below (that's on the last row),
* Use `Shift+Home` and `Shift+End` to navigate horizontally to the first and respectively last cell in the current row.

</Note>

Keyboard navigation is controlled by the <PropLink name="keyboardNavigation" /> prop, which can be either `"cell"`, `"row"` or `false`. Navigating table cells is the default behavior.


## Using a default active cell


You can also specify an initial active cell, by using <PropLink name="defaultActiveCellIndex">defaultActiveCellIndex=[2,4]</PropLink>. This tells the table that there should be a default active cell, namely the one at index 2,4 (row 2, so third row; column 4, so fifth column).

<Note>

The active cell should be an array of length 2, where the first number is the index of the row and the second number is the index of the column (both are zero-based).

</Note>


<Sandpack>

<Description>

This example starts with cell `[2,0]` already active.

</Description>

```ts file=navigating-cells-uncontrolled-example.page.tsx
```
</Sandpack>


## Listening to active cell changes

You can easily listen to changes in the cell navigation by using the <PropLink name="onActiveCellIndexChange">onActiveCellIndexChange</PropLink> callback.

<Note>

When you use controlled <PropLink name="activeCellIndex" />, make sure to use <PropLink name="onActiveCellIndexChange">onActiveCellIndexChange</PropLink> to update the prop value, as otherwise the component will not update on navigation

</Note>


<Sandpack>

<Description>

This example starts with cell `[2,0]` already active and uses <PropLink name="onActiveCellIndexChange">onActiveCellIndexChange</PropLink> to update <PropLink name="activeCellIndex" />.

</Description>

```ts file=navigating-cells-controlled-example.page.tsx
```
</Sandpack>

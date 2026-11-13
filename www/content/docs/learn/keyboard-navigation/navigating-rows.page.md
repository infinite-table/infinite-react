---
title: Keyboard Navigation for Table Rows
---

To enable keyboard navigation for table rows, specify <PropLink name="keyboardNavigation">keyboardNavigation="row"</PropLink> in your React Infinite Table component.

When row navigation is enabled, clicking a row highlights it and the user can use the arrow keys to navigate the table rows.

<DemoDescription>

Click on the table and use the arrow keys to navigate the rows.

</DemoDescription>

```tsx file="navigating-rows-initial-example.demo.tsx"
```

<Note>

- Use `ArrowUp` and `ArrowDown` to navigate to the previous and next row.
- Use `PageUp` and `PageDown` to navigate the rows vertically by pages (a page is considered equal to the visible row count).
- Use `Home` and `End` to navigate vertically to the first and last row respectively

</Note>

Other possible values for the <PropLink name="keyboardNavigation" /> prop, besides `"row"`, are `"cell"` and `false`.

## Using a default active row

You can also specify an initial active row, by using <PropLink name="defaultActiveRowIndex">defaultActiveRowIndex=2</PropLink>. This tells the table that there should be a default active row, namely the one at index 2 (so the third row).

<DemoDescription>

This example starts with row at index `2` already active.

</DemoDescription>

```tsx file="navigating-rows-uncontrolled-example.demo.tsx"
```

## Listening to active row changes

You can easily listen to changes in the row navigation by using the <PropLink name="onActiveRowIndexChange" /> callback.

<Note>

When you use controlled <PropLink name="activeRowIndex" />, make sure to use <PropLink name="onActiveRowIndexChange">onActiveRowIndexChange</PropLink> to update the prop value, as otherwise the component will not update on navigation

</Note>

<DemoDescription>

This example starts with row at index `2` already active and uses <PropLink name="onActiveRowIndexChange">onActiveRowIndexChange</PropLink> to update <PropLink name="activeRowIndex" />.

</DemoDescription>

```tsx file="navigating-rows-controlled-example.demo.tsx"
```

## Toggling group rows

When the DataSource is <DPropLink name="groupBy" code={false}>grouped</DPropLink>, you can use the keyboard to collapse/expand group rows, by pressing the `Enter` key on the active row.

<Note>

Since you're in row navigation mode, you can also use

- `←` to collapse a group row
- `→` to expand a group row

</Note>

<DemoDescription>

Press the `Enter` key on the active group row to toggle it. `ArrowLeft` will collapse a group row and `ArrowRight` will expand a group row.

</DemoDescription>

```tsx file="/docs/reference/keyboard-toggle-group-rows.demo.tsx"
```

## Selecting Rows with the Keyboard

When <DPropLink name="rowSelection" /> is enabled (read more about it in the [row selection page](../selection/row-selection)), you can use the spacebar key to select a group row (or `shift` + spacebar to do multiple selection).

By default <PropLink name="keyboardSelection" /> is enabled, so you can use the **spacebar** key to select multiple rows, when <DPropLink name="selectionMode">selectionMode="multi-row"</DPropLink>. Using the spacebar key is equivalent to doing a mouse click, so expect the combination of **spacebar** + `cmd`/`ctrl`/`shift` modifier keys to behave just like clicking + the same modifier keys.

<DemoDescription>

Use spacebar + optional `cmd`/`ctrl`/`shift` modifier keys just like you would do clicking + the same modifier keys.

</DemoDescription>

```tsx file="/docs/reference/default-selection-mode-multi-row-keyboard-toggle-example-row-navigation.demo.tsx" title="Multi row selection with keyboard support"
```

<Note>

For selection all the rows in the table, you can use `cmd`/`ctrl` + `A` keyboard shortcut.

</Note>

<Note>

Keyboard selection is also possible when there's a column configured with checkbox selection - [make sure you read more about it](../selection/row-selection#using-a-selection-checkbox).

</Note>

## Theming

By default, the style of the element that highlights the active row is the same style as that of the element that highlights the active cell.

The easiest is to override the style is via those three CSS variables:

- `--infinite-active-cell-border-color--r` - the `red` component of the border color
- `--infinite-active-cell-border-color--g` - the `green` component of the border color
- `--infinite-active-cell-border-color--b` - the `blue` component of the border color

The initial values for those are `77`, `149` and`215` respectively, so the border color is `rgb(77, 149, 215)`.

In addition, the background color of the element that highlights the active row is set to the same color as the border color (computed based on the above `r`, `g` and `b` variables), but with an opacity of `0.25`, configured via the `--infinite-active-row-background-alpha` CSS variable.

When the table is not focused, the opacity for the background color is set to `0.1`, which is the default value of the `--infinite-active-row-background-alpha--table-unfocused` CSS variable.

<Note>
 
To summarize, use

- `--infinite-active-cell-border-color--r`
- `--infinite-active-cell-border-color--g`
- `--infinite-active-cell-border-color--b`

to control border and background color of the active row highlight element.

No, it's not a mistake that the element that highlights the active row is configured via the same CSS variables as the element that highlights the active cell. This is deliberate - so override CSS variables for cell, and those are propagated to the row highlight element.

</Note>

There are other CSS variables as well, that give you fined-tuned control over both the border and background color for the active row, if you don't want to use the above three variables to propagate the same color across both border and background.

- `--infinite-active-cell-background` - the background color. If you use this, you need to set opacity yourself. Applied for both cell and row.
- `--infinite-active-row-background` - the background color. If you use this, you need to set opacity yourself. If this is specified, it takes precendence over `--infinite-active-cell-background`
- `--infinite-active-cell-background` - the background color. If you use this, you need to set opacity yourself. Applied for both cell and row.
- `--infinite-active-row-background` - the background color. If this is specified, it takes precedence over `--infinite-active-cell-background`
- `--infinite-active-row-border` - border configuration (eg:`2px solid magenta`). If you use this, it will not be propagated to the background color.

For more details on the CSS variables, see the [CSS Variables documentation](../theming/css-variables##active-row-background).

<DemoDescription>

Use the color picker to configured the desired color for the active row highlight

</DemoDescription>

```tsx file="navigating-rows-theming-example.demo.tsx" title="Theming active row highlight"
```

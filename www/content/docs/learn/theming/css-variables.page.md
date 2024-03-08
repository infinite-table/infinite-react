---
title: CSS Variables
description: Reference list of CSS variables that can be used to style the Infinite Table for React
---

Below you can find the complete list of CSS variables that can be used to style the component.

{/* START VARS */}
### Accent color

Brand-specific accent color. This probably needs override to match your app.

```css
--infinite-accent-color
```

### Error color



```css
--infinite-error-color
```

### Color

The text color inside the component

```css
--infinite-color
```

### Space 0



```css
--infinite-space-0
```

### Space 1



```css
--infinite-space-1
```

### Space 2



```css
--infinite-space-2
```

### Space 3



```css
--infinite-space-3
```

### Space 4



```css
--infinite-space-4
```

### Space 5



```css
--infinite-space-5
```

### Space 6



```css
--infinite-space-6
```

### Space 7



```css
--infinite-space-7
```

### Space 8



```css
--infinite-space-8
```

### Space 9



```css
--infinite-space-9
```

### Space 10



```css
--infinite-space-10
```

### Font size 0



```css
--infinite-font-size-0
```

### Font size 1



```css
--infinite-font-size-1
```

### Font size 2



```css
--infinite-font-size-2
```

### Font size 3



```css
--infinite-font-size-3
```

### Font size 4



```css
--infinite-font-size-4
```

### Font size 5



```css
--infinite-font-size-5
```

### Font size 6



```css
--infinite-font-size-6
```

### Font size 7



```css
--infinite-font-size-7
```

### Font family



```css
--infinite-font-family
```

### Min height



```css
--infinite-min-height
```

### Border radius



```css
--infinite-border-radius
```

### Background

The background color for the whole component.

Overriden in the `dark` theme.

```css
--infinite-background
```

### Icon size



```css
--infinite-icon-size
```

### Load mask padding

The padding used for the content inside the LoadMask.

```css
--infinite-load-mask-padding
```

### Load mask color



```css
--infinite-load-mask-color
```

### Load mask text background



```css
--infinite-load-mask-text-background
```

### Load mask overlay background



```css
--infinite-load-mask-overlay-background
```

### Load mask overlay opacity



```css
--infinite-load-mask-overlay-opacity
```

### Load mask border radius



```css
--infinite-load-mask-border-radius
```

### Header background

Background color for the header. Defaults to [`--infinie-header-cell-background`](#header-cell-background).

Overriden in the `dark` theme.

```css
--infinite-header-background
```

### Header color

The text color inside the header.

Overriden in the `dark` theme.

```css
--infinite-header-color
```

### Column header height

The height of the column header.

```css
--infinite-column-header-height
```

### Header cell background

Background for header cells.

Overriden in the `dark` theme.

```css
--infinite-header-cell-background
```

### Header cell hover background



```css
--infinite-header-cell-hover-background
```

### Header cell padding



```css
--infinite-header-cell-padding
```

### Header cell padding x



```css
--infinite-header-cell-padding-x
```

### Header cell padding y



```css
--infinite-header-cell-padding-y
```

### Header cell icon size



```css
--infinite-header-cell-icon-size
```

### Header cell menu icon line width



```css
--infinite-header-cell-menu-icon-line-width
```

### Header cell sort icon margin



```css
--infinite-header-cell-sort-icon-margin
```

### Resize handle active area width

The width of the area you can hover over in order to grab the column resize handle.
Defaults to `20px`.

The purpose of this active area is to make it easier to grab the resize handle.

```css
--infinite-resize-handle-active-area-width
```

### Resize handle width

The width of the colored column resize handle that is displayed on hover and on drag. Defaults to `2px`

```css
--infinite-resize-handle-width
```

### Resize handle hover background

The color of the column resize handle - the resize handle is the visible indicator that you see
when hovering over the right-edge of a resizable column. Also visible on drag while doing a column resize.

```css
--infinite-resize-handle-hover-background
```

### Resize handle constrained hover background

The color of the column resize handle when it has reached a min/max constraint.

```css
--infinite-resize-handle-constrained-hover-background
```

### Filter operator padding x



```css
--infinite-filter-operator-padding-x
```

### Filter editor padding x



```css
--infinite-filter-editor-padding-x
```

### Filter editor margin x



```css
--infinite-filter-editor-margin-x
```

### Filter operator padding y



```css
--infinite-filter-operator-padding-y
```

### Filter editor padding y



```css
--infinite-filter-editor-padding-y
```

### Filter editor margin y



```css
--infinite-filter-editor-margin-y
```

### Filter editor background



```css
--infinite-filter-editor-background
```

### Filter editor border



```css
--infinite-filter-editor-border
```

### Filter editor focus border color



```css
--infinite-filter-editor-focus-border-color
```

### Filter editor border radius



```css
--infinite-filter-editor-border-radius
```

### Filter editor color



```css
--infinite-filter-editor-color
```

### Cell padding



```css
--infinite-cell-padding
```

### Cell border width



```css
--infinite-cell-border-width
```

### Cell border

Specifies the border for cells.

Overriden in the `dark` theme - eg: `1px solid #2a323d`

```css
--infinite-cell-border
```

### Cell border invisible



```css
--infinite-cell-border-invisible
```

### Cell border radius



```css
--infinite-cell-border-radius
```

### Column reorder effect duration



```css
--infinite-column-reorder-effect-duration
```

### Pinned cell border



```css
--infinite-pinned-cell-border
```

### Cell color

Text color inside rows. Defaults to `currentColor`

Overriden in `dark` theme.

```css
--infinite-cell-color
```

### Selected cell background

The background for selected cells, when cell selection is enabled.

If not specified, it will default to `var(--infinite-active-cell-background)`.

```css
--infinite-selected-cell-background
```

### Selected cell background default



```css
--infinite-selected-cell-background-default
```

### Selected cell background alpha

The opacity of the background color for the selected cell.

If not specified, it will default to the value for `var(--infinite-active-cell-background-alpha)`

```css
--infinite-selected-cell-background-alpha
```

### Selected cell background alpha table unfocused

The opacity of the background color for the selected cell, when the table is unfocused.
If not specified, it will default to `var(--infinite-active-cell-background-alpha--table-unfocused)`.

```css
--infinite-selected-cell-background-alpha--table-unfocused
```

### Selected cell border color

The color for border of the selected cell (when cell selection is enabled).
 Defaults to `var(--infinite-active-cell-border-color)`.

```css
--infinite-selected-cell-border-color
```

### Selected cell border width

The width of the border for the selected cell. Defaults to `var(--infinite-active-cell-border-width)`.

```css
--infinite-selected-cell-border-width
```

### Selected cell border style

The style of the border for the selected cell (eg: 'solid', 'dashed', 'dotted') - defaults to 'dashed'.
Defaults to `var(--infinite-active-cell-border-style)`.

```css
--infinite-selected-cell-border-style
```

### Selected cell border

Specifies the border for the selected cell. Defaults to `var(--infinite-selected-cell-border-width) var(--infinite-selected-cell-border-style) var(--infinite-selected-cell-border-color)`.

```css
--infinite-selected-cell-border
```

### Active cell background alpha

The opacity of the background color for the active cell (when cell keyboard navigation is enabled).
Eg: 0.25

If `activeBackground` is not explicitly defined (this is the default), the background color of the active cell
is the same as the border color (`activeBorderColor`), but with this modified opacity.

If `activeBorderColor` is also not defined, the accent color will be used.

This is applied when the component has focus.

```css
--infinite-active-cell-background-alpha
```

### Active cell background alpha table unfocused

Same as the above, but applied when the component does not have focus.

```css
--infinite-active-cell-background-alpha--table-unfocused
```

### Active cell background

The background color of the active cell.

If not specified, it will default to `activeBorderColor` with the opacity of `activeBackgroundAlpha`.
If `activeBorderColor` is not specified, it will default to the accent color, with the same opacity as mentioned.

However, specify this to explicitly override the default.

```css
--infinite-active-cell-background
```

### Active cell background default



```css
--infinite-active-cell-background-default
```

### Active cell border color

The color for border of the active cell (when cell keyboard navigation is enabled).

```css
--infinite-active-cell-border-color
```

### Active cell border width

The width of the border for the active cell.

```css
--infinite-active-cell-border-width
```

### Active cell border style

The style of the border for the active cell (eg: 'solid', 'dashed', 'dotted') - defaults to 'dashed'.

```css
--infinite-active-cell-border-style
```

### Active cell border

Specifies the border for the active cell. Defaults to `var(--infinite-active-cell-border-width) var(--infinite-active-cell-border-style) var(--infinite-active-cell-border-color)`.

```css
--infinite-active-cell-border
```

### Selection checkbox margin inline



```css
--infinite-selection-checkbox-margin-inline
```

### Menu background



```css
--infinite-menu-background
```

### Menu color



```css
--infinite-menu-color
```

### Menu padding



```css
--infinite-menu-padding
```

### Menu cell padding vertical



```css
--infinite-menu-cell-padding-vertical
```

### Menu cell padding horizontal



```css
--infinite-menu-cell-padding-horizontal
```

### Menu cell margin vertical



```css
--infinite-menu-cell-margin-vertical
```

### Menu item disabled background



```css
--infinite-menu-item-disabled-background
```

### Menu item active background



```css
--infinite-menu-item-active-background
```

### Menu item active opacity



```css
--infinite-menu-item-active-opacity
```

### Menu item pressed opacity



```css
--infinite-menu-item-pressed-opacity
```

### Menu item pressed background



```css
--infinite-menu-item-pressed-background
```

### Menu item disabled opacity



```css
--infinite-menu-item-disabled-opacity
```

### Menu border radius



```css
--infinite-menu-border-radius
```

### Menu shadow color



```css
--infinite-menu-shadow-color
```

### Rowdetail background



```css
--infinite-rowdetail-background
```

### Rowdetail padding



```css
--infinite-rowdetail-padding
```

### Rowdetail grid height



```css
--infinite-rowdetail-grid-height
```

### Row background

Background color for rows. Defaults to [`--infinite-background`](#background).

Overriden in `dark` theme.

```css
--infinite-row-background
```

### Row odd background

Background color for odd rows. Even rows will use [`--infinite-row-background`](#row-background).

Overriden in `dark` theme.

```css
--infinite-row-odd-background
```

### Row selected background



```css
--infinite-row-selected-background
```

### Active row background

The background color of the active row. Defaults to the value of `var(--infinite-active-cell-background)`.

However, specify this to explicitly override the default.

```css
--infinite-active-row-background
```

### Active row border color

The border color for the active row. Defaults to the value of `var(--infinite-active-cell-border-color)`.

```css
--infinite-active-row-border-color
```

### Active row border width

The width of the border for the active row. Defaults to the value of `var(--infinite-active-cell-border-width)`.

```css
--infinite-active-row-border-width
```

### Active row border style

The style of the border for the active row (eg: 'solid', 'dashed', 'dotted') - defaults to the value of `var(--infinite-active-cell-border-style)`, which is `dashed` by default.

```css
--infinite-active-row-border-style
```

### Active row border

Specifies the border for the active row. Defaults to `var(--infinite-active-row-border-width) var(--infinite-active-row-border-style) var(--infinite-active-row-border-color)`.

```css
--infinite-active-row-border
```

### Active row background alpha

The opacity of the background color for the active row (when row keyboard navigation is enabled).
When you explicitly specify `--infinite-active-row-background`, this variable will not be used.
Instead, this variable is used when the active row background uses the color of the active cell (border).

This is applied when the component has focus.

Defaults to the value of `var(--infinite-active-cell-background-alpha)`.

```css
--infinite-active-row-background-alpha
```

### Active row background alpha table unfocused

Same as the above, but applied when the component does not have focus.

When you explicitly specify `--infinite-active-row-background`, this variable will not be used.
Instead, this variable is used when the active row background uses the color of the active cell (border).

Defaults to the value of `var(--infinite-active-cell-background-alpha--table-unfocused)`.

```css
--infinite-active-row-background-alpha--table-unfocused
```

### Row hover background

Background color for rows, on hover.

Overriden in the `dark` theme.

```css
--infinite-row-hover-background
```

### Row selected hover background



```css
--infinite-row-selected-hover-background
```

### Group row background



```css
--infinite-group-row-background
```

### Group row column nesting



```css
--infinite-group-row-column-nesting
```

### Row pointer events while scrolling



```css
--infinite-row-pointer-events-while-scrolling
```{/* END VARS */}

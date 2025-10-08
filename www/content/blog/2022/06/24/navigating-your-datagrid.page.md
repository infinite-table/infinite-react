---
title: DataGrid Keyboard Navigation
author: [admin]
excerpt: With version `0.3.6` Infinite Table added keyboard navigation to your favorite React DataGrid component.
date: 2022-06-24
---

Using your keyboard to navigate around an app is crucial to moving fast and being productive.

With version `0.3.6` Infinite Table added keyboard navigation to your favorite React DataGrid component.

## Navigating table cells

By default, navigation is enabled for table cells - that means, as soon as the user clicks a cell, it becomes active and from that point on-wards, the user can use **arrow keys**, **page up/down** and **home/end** keys to navigate.

Check out our [documentation for keyboard navigation](/docs/learn/keyboard-navigation/navigating-cells) to see more demos and a complete reference guide.

<Note>

Pro tip: when in cell navigation mode, you can use the **`Shift` key** to navigate horizontally in combination with **page up/down** and **home/end keys**.

</Note>

In the example below, click a table cell and then use arrow keys to see keyboard navigation in action

<CSEmbed id="cell-keyboard-navigation-d3qrx1" title="Keyboard navigation is enabled by default">

<Description>

Click any cell in the grid and start navigating around using arrow keys.

</Description>
</CSEmbed>

Another nice feature of keyboard navigation for cells is that you can specify a default active cell - you do so by using `defaultActiveCell=[2,0]` - meaning the cell on row 2 and column 0 should be active initially.

<CSEmbed title="Default cell selection" id="infinite-table-default-cell-selection-ohx8e3">
<Description>

In this example, the cell at position `[1, 1]` (so second row and second column) is selected by default.

</Description>

</CSEmbed>

## Navigating table rows

Besides cell navigation, row navigation is also available. Switch to row navigation mode by specifying `keyboardNavigation="row"` - the rest is similar: user clicks a row, which becomes the active row. Using arrow keys, page up/down and home/end works as expected.

Having a default row set as active is also possible, via <PropLink name="defaultActiveRowIndex">defaultActiveRowIndex={2}</PropLink> - this means the row at index `2` should be initially rendered as active.

<CSEmbed id="infinite-table-keyboard-navigation-for-rows-with-default-selection-ve1nbk" title="Keyboard navigation for rows with default selection">

<Description>

In this example, keyboard navigation for rows is enabled, with row at index 2 being active by default.

</Description>

</CSEmbed>

## Controlling active row/cell

Both cell and row navigation can be used as React uncontrolled and controlled behaviors.

In the controlled version, you have to use <PropLink name="onActiveCellIndexChange" /> (or <PropLink name="onActiveRowIndexChange"/>) to respond to navigation changes and update the corresponding index.

The example below demoes controlled cell navigation - initially starting with no active cell, and it updates the active cell as a result to user changes. This means you as a developer are responsible for updating the value when needed, as you no longer wish to leave this update to happen internally in the table. This makes controlled behavior excellent for advanced use-cases when you want to implement custom navigation logic.

<CSEmbed id="infinite-table-controlled-cell-navigation-kjl4qx" title="Controlled cell navigation">

</CSEmbed>

## Turning off keyboard navigation

Disabling keyboard navigation is done by specifying <PropLink name="keyboardNavigation">keyboardNavigation=false</PropLink> - this ensures the user can no longer interact with the table rows or cells via the keyboard.

## Theming

There are a number of ways to customise the appearance of the element that highlights the active cell.

The easiest is to override those three CSS variables:

- `--infinite-active-cell-border-color--r` - the red component of the border color
- `--infinite-active-cell-border-color--g` - the green component of the border color
- `--infinite-active-cell-border-color--b` - the blue component of the border color

The initial values for those are 77, 149 and215 respectively, so the border color is `rgb(77, 149, 215)`.
In addition, the background color of the active cell highlight element is set to the same color as the border color (computed based on the above r, g and b variables), but with an opacity of `0.25`, configured via the `--infinite-active-cell-background-alpha` CSS variable.

When the table is not focused, the opacity for the background color is set to `0.1`, which is the default value of the `--infinite-active-cell-background-alpha--table-unfocused` CSS variable.

To summarize, use:

- `--infinite-active-cell-border-color--r`
- `--infinite-active-cell-border-color--g`
- `--infinite-active-cell-border-color--b`
  to control border and background color of the active cell highlight element.

See below a demo on how easy it is to customize the colors for the active element highlighter

<CSEmbed id="infinite-table-theming-keyboard-navigation-htukio" title="Theming keyboard navigation">

</CSEmbed>

## Enjoy

Thanks for following us thus far - we appreciate feedback, so please to let us know if keyboard navigation is useful for you or how we could make it better.

Please follow us [@get_infinite](https://twitter.com/get_infinite) to keep up-to-date with news about the product. Thank you.

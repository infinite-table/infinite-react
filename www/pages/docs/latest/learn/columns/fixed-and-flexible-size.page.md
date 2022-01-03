---
title: Column Sizing
---

Columns can be configured to have either a fixed or flexible size. In addition, you can have column min and max sizes and also default column sizes.

<Note>

Use <PropLink name="columnDefaultWidth"/> to configure the default column width. If a column is not sized otherwise, this will be applied. The default value for <PropLink name="columnDefaultWidth"/> is `200` (pixels).

For setting a minimum and maximum width for all columns, use <PropLink name="columnMinWidth"/> (defaults to `30`) and <PropLink name="columnMaxWidth"/> (defaults to `2000`) respectively.

</Note>

Sizing the column is done via the controlled <PropLink name="columnSizing"/> prop and it's uncontrolled variant, <PropLink name="defaultColumnSizing" />. If you want to get updates to columns changing size as a result of user interaction, use <PropLink name="onColumnSizingChange" />.


## Fixed vs flexible sizing

The <PropLink name="columnSizing" /> prop is an object (or Map) of column ids to column sizing objects. Those sizing objects can have the following properties:
 * <PropLink name="columnSizing.flex">flex</PropLink> - use this for flexible columns. Behaves like the `flex` CSS property.
 * <PropLink name="columnSizing.width">width</PropLink> - use this for fixed sized columns
 * <PropLink name="columnSizing.minWidth">minWidth</PropLink> - specifies the minimum width of the column. Useful for flexible columns or for restricting users resizing both fixed and flexible columns.
 * <PropLink name="columnSizing.maxWidth">maxWidth</PropLink> - specifies the maximum width of the column. Useful for flexible columns or for restricting users resizing both fixed and flexible columns.

<Note>

If a column is not specified in the <PropLink name="columnSizing" /> prop (or its uncontrolled variant), or sized otherwise (eg: via the column type), it will have a fixed size, defaulting to <PropLink name="columnDefaultWidth"/> (which also defaults to `200` if no value is passed in).

</Note>


<DeepDive title="Flexible sizing explained" excerpt="The way flex sizing is implemented is similar to how CSS flexbox algorithm works. Explore this section to find out more details.">

Imagine you have `1000px` of space available to the viewport of `InfiniteTable` and you have 3 columns: 
* a fixed column `100px` wide - name it col `A`
* a fixed column `300px` wide - name it col `B`
* a flexible column with `flex: 1` - name it col `F1`
* a flexible column with `flex: 2` - name it col `F2`

The space remaining for the flexible columns is `1000px - 400px = 600px` and the sum of all flex values is `3`, that means each `flex` unit will be `600px / 3 = 200px`.

This means columns will have the following sizes:
 * col `A` will be `100px`
 * col `B` will be `300px`
 * col `F1` will be `200px` ( so a flex unit)
 * col `F2` will be `400px` ( so the equivalent of `2` flex units)

If the browser changes the layout of the component, so `InfiniteTable` has only `700px` available, then a flex unit would be `(700px - 400px) / 3 = 100px`.

This means columns will have the following sizes:
 * col `A` will be `100px`
 * col `B` will be `300px`
 * col `F1` will be `100px` ( so a flex unit)
 * col `F2` will be `200px` ( so the equivalent of `2` flex units)

 The flexbox algorithm also uses <PropLink name="viewportReservedWidth" /> to determine the width of the viewport to use for sizing columns - you can use <PropLink name="viewportReservedWidth">viewportReservedWidth=100</PropLink> to always have a `100px` reserved area that won't be used for flexing columns.

</DeepDive>

---
title: Infinite Table Keyboard Navigation API
layout: API
---

Available starting with version `6.1.1`.

See the [Keyboard Navigation](/docs/learn/keyboard-navigation/navigating-cells) page for more details.

```tsx file="index.snippet.tsx" region="configuring-the-keyboard-navigation-to-be-cell" title="Configuring the keyboard navigation to be 'cell'"
```

You can retrieve the keyboard navigation api by reading it from the `api.keyboardNavigationApi` property.

```tsx file="index.snippet.tsx" region="intro"
```

See the [Infinite Table API page](/docs/reference/api) for the main API.
See the [Infinite Table Cell Selection API page](/docs/reference/cell-selection-api) for the row selection API.
See the [Infinite Table Row Selection API page](/docs/reference/row-selection-api) for the row selection API.
See the [Infinite Table Column API page](/docs/reference/column-api) for the column API.

<PropTable sort searchPlaceholder="Type to filter API methods">

<Prop name="setKeyboardNavigation" type="(keyboardNavigation: 'cell'|'row'|false) => void">

> Sets the keyboard navigation mode. See <PropLink name="keyboardNavigation" />

The sole argument is of the same type as the <PropLink name="keyboardNavigation" />

See the [Keyboard Navigation](/docs/learn/keyboard-navigation/navigating-cells) page for more details.

<Note>

If you are using controlled <PropLink name="activeCellIndex" /> or <PropLink name="activeRowIndex" />, make sure you update the values by using the <PropLink name="onActiveCellIndexChange" /> and <PropLink name="onActiveRowIndexChange" /> callbacks respectively.

</Note>

</Prop>


<Prop name="setActiveCellIndex" type="(activeCellIndex: [number, number]) => void">

> Sets the value for <PropLink name="defaultActiveCellIndex" />/<PropLink name="activeCellIndex" />
See related <KeyNavApiLink name="gotoCell" />


<Note>

If you are using controlled <PropLink name="activeCellIndex" /> make sure you update the controlled value by using the <PropLink name="onActiveCellIndexChange" /> callback prop.

</Note>

</Prop>

<Prop name="setActiveRowIndex" type="(activeRowIndex: number) => void">

> Sets the value for <PropLink name="defaultActiveRowIndex" />/<PropLink name="activeRowIndex" />


<Note>

If you are using controlled <PropLink name="activeRow" />, make sure you update the values by using the <PropLink name="onActiveRowIndexChange" /> callback prop.

</Note>

</Prop>

<Prop name="gotoNextRow" type="()=> number | false">

> Changes the active row index to the next row. See related <KeyNavApiLink name="gotoPreviousRow" />, <KeyNavApiLink name="setActiveRowIndex" />

Returns `false` if the action was not successful (eg: already at the last row), otherwise the new active row index.

This sets the value for <PropLink name="activeCellIndex" />

</Prop>


<Prop name="gotoPreviousRow" type="()=> number | false">

> Changes the active row index to the prev row. See related <KeyNavApiLink name="gotoNextRow" />, <KeyNavApiLink name="setActiveRowIndex" />

Returns `false` if the action was not successful (eg: already at the first row), otherwise the new active row index.

This sets the value for <PropLink name="activeCellIndex" />

</Prop>

<Prop name="gotoCell" type="({direction: 'top' | 'bottom' | 'left' | 'right' }) => [number, number] | false">

> Changes the active cell index, by navigating to the specified direction (equivalent to pressing the arrow keys).
See related <KeyNavApiLink name="setActiveCellIndex" />

```tsx file="goto-cell-example.demo.tsx" title="Using KeyboardNavigationApi.gotoCell"
```


</Prop>

</PropTable>

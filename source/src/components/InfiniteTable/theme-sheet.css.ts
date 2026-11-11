import { SheetDarkVars } from './vars-sheet-dark.css';
import { SheetLightVars } from './vars-sheet-light.css';
import { InfiniteTableColumnCellClassName } from './components/InfiniteTableRow/InfiniteTableColumnCellClassNames';
import { InfiniteTableHeaderWrapperClassName } from './components/InfiniteTableHeader/headerClassName';
import { rootClassName } from './internalProps';

import { defineTheme } from './defineTheme.css';
import { ThemeVars } from './vars.css';

const cell = InfiniteTableColumnCellClassName;

// `var(--x)` => `--x` - nested selector blocks don't support `vars`, so
// the custom properties are declared by name
const cssVarName = (value: string) => value.replace(/^var\((--[^,)]+)\)$/, '$1');

const sheetStyles = {
  // the first pinned column looks like the row number gutter of a spreadsheet
  // (via the variables the cells use, so the row states still apply)
  [`& .${cell}--first.${cell}--pinned-start`]: {
    [cssVarName(ThemeVars.components.Row.background)]:
      ThemeVars.components.HeaderCell.background,
    [cssVarName(ThemeVars.components.Row.oddBackground)]:
      ThemeVars.components.HeaderCell.background,
    [cssVarName(ThemeVars.components.Row.hoverBackground)]:
      ThemeVars.components.HeaderCell.hoverBackground,
    [cssVarName(ThemeVars.components.Row.selectedBackground)]:
      ThemeVars.components.HeaderCell.hoverBackground,
    [cssVarName(ThemeVars.components.Cell.color)]:
      ThemeVars.components.Header.color,
  },
  [`& .${InfiniteTableHeaderWrapperClassName}`]: {
    borderBottom: ThemeVars.components.HeaderCell.border,
  },
  // the fill handle of the active cell - decorative
  [`& .${rootClassName}-ActiveCellIndicator::after`]: {
    content: '""',
    position: 'absolute',
    width: '6px',
    height: '6px',
    right: '-4px',
    bottom: '-4px',
    background: ThemeVars.color.accent,
    border: `1px solid ${ThemeVars.background}`,
  },
};

defineTheme('sheet', {
  lightStyles: {
    vars: SheetLightVars,
    ...sheetStyles,
  },
  darkStyles: {
    vars: SheetDarkVars,
    ...sheetStyles,
  },
});

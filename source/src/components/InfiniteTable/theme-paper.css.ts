import { PaperDarkVars } from './vars-paper-dark.css';
import { PaperLightVars } from './vars-paper-light.css';
import { InfiniteTableColumnCellClassName } from './components/InfiniteTableRow/InfiniteTableColumnCellClassNames';
import {
  InfiniteTableHeaderCellClassName,
  InfiniteTableHeaderWrapperClassName,
} from './components/InfiniteTableHeader/headerClassName';

import { defineTheme } from './defineTheme.css';
import { ThemeVars } from './vars.css';

const cell = InfiniteTableColumnCellClassName;
const PILL_INSET = '3px';
const PILL_RADIUS = '8px';

// the nested rules are the same for the light and dark modes (with native
// nesting, the theme selectors would not keep their specificity), so the
// colors come from the variables, which follow the mode
const PILL = `color-mix(in srgb, ${ThemeVars.color.accent} 12%, ${ThemeVars.background})`;
const PILL_HOVER = `color-mix(in srgb, ${ThemeVars.color.accent} 17%, ${ThemeVars.background})`;

const paperStyles = {
  [`& .${InfiniteTableHeaderWrapperClassName}`]: {
    borderBottom: ThemeVars.components.Cell.borderTop,
  },
  [`& .${InfiniteTableHeaderCellClassName}`]: {
    fontWeight: 500,
  },
  [`& .${cell}--group-row`]: {
    fontWeight: 500,
  },
  // the selected rows are rounded pills, inset from the row edges
  [`& .${cell}--row-selected:not(.${cell}--cell-selected)::before`]: {
    content: '""',
    position: 'absolute',
    insetBlock: PILL_INSET,
    insetInline: 0,
    zIndex: -1,
    pointerEvents: 'none',
    background: PILL,
  },
  [`& .${cell}--row-selected.${cell}--first::before`]: {
    insetInlineStart: '4px',
    borderStartStartRadius: PILL_RADIUS,
    borderEndStartRadius: PILL_RADIUS,
  },
  [`& .${cell}--row-selected.${cell}--last::before`]: {
    insetInlineEnd: '4px',
    borderStartEndRadius: PILL_RADIUS,
    borderEndEndRadius: PILL_RADIUS,
  },
  [`& .${cell}--row-selected.${cell}--hovered::before`]: {
    background: PILL_HOVER,
  },
  // the sort index next to (not over) the sort arrow
  [`& .InfiniteIcon-sort [data-name="index"]`]: {
    right: '-7px',
  },
  // a rounded active cell
  [`& .Infinite-ActiveCellIndicator`]: {
    borderRadius: '6px',
  },
};

defineTheme('paper', {
  lightStyles: {
    vars: PaperLightVars,
    ...paperStyles,
  },
  darkStyles: {
    vars: PaperDarkVars,
    ...paperStyles,
  },
});

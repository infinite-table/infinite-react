import { TerminalDarkVars } from './vars-terminal-dark.css';
import { TerminalLightVars } from './vars-terminal-light.css';
import {
  InfiniteTableHeaderCellClassName,
  InfiniteTableHeaderWrapperClassName,
} from './components/InfiniteTableHeader/headerClassName';
import { InfiniteTableColumnCellClassName } from './components/InfiniteTableRow/InfiniteTableColumnCellClassNames';

import { defineTheme } from './defineTheme.css';
import { ThemeVars } from './vars.css';

const terminalStyles = {
  // numbers line up, column after column
  [`& .${InfiniteTableColumnCellClassName}`]: {
    fontVariantNumeric: 'tabular-nums',
  },
  [`& .${InfiniteTableHeaderCellClassName}`]: {
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: 600,
    fontSize: '0.92em',
  },
  [`& .${InfiniteTableHeaderWrapperClassName}`]: {
    borderBottom: ThemeVars.components.Cell.pinnedBorder,
  },
};

defineTheme('terminal', {
  lightStyles: {
    vars: TerminalLightVars,
    ...terminalStyles,
  },
  darkStyles: {
    vars: TerminalDarkVars,
    ...terminalStyles,
  },
});

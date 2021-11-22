import { style, styleVariants } from '@vanilla-extract/css';
import { ThemeVars } from '../../theme.css';

import {
  CellBorderCls,
  // CellCls,
  // CellClsVariants,
  // ColumnCellVariantsObject,
} from '../cell.css';
// export { CellCls, CellClsVariants };

export const HeaderCellCls = style([
  CellBorderCls,

  {
    background: ThemeVars.components.HeaderCell.background,
    padding: ThemeVars.components.HeaderCell.padding,
    borderRight: ThemeVars.components.Cell.border,
  },
]);
const cellVariantsObj = {
  first: {
    borderTopLeftRadius: ThemeVars.components.Cell.borderRadius,
    borderBottomLeftRadius: ThemeVars.components.Cell.borderRadius,
  },
  last: {
    borderTopRightRadius: ThemeVars.components.Cell.borderRadius,
    borderBottomRightRadius: ThemeVars.components.Cell.borderRadius,
  },
  groupByField: {},
  firstInCategory: {},
  lastInCategory: {},
  pinnedStart: {},
  pinnedEnd: {},
  unpinned: {},
};
export const HeaderCellVariants = styleVariants({
  dragging: {
    zIndex: 100,
    opacity: 0.8,
    background: ThemeVars.components.HeaderCell.draggingBackground,
  },

  ...cellVariantsObj,
  pinnedStart: {
    ...cellVariantsObj.pinnedStart,
    zIndex: 10,
  },
});
export const HeaderCellProxy = style({
  background: ThemeVars.components.Header.background,
  opacity: 0.9,
  padding: ThemeVars.components.Cell.padding,
  paddingLeft: 20,
  zIndex: 200,
});

export const HeaderCls = style({
  background: ThemeVars.components.Header.background,
  color: ThemeVars.components.Header.color,
});

export const HeaderClsVariants = styleVariants({
  unvirtualized: {
    position: 'relative',
    overflow: 'hidden',
  },
  overflow: {
    zIndex: 10,
  },
  virtualized: {},
});

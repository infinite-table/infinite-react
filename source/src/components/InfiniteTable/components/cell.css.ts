import { style, styleVariants } from '@vanilla-extract/css';
import { ThemeVars } from '../theme.css';

import { position, whiteSpace, willChange } from '../utilities.css';

export const CellBorderCls = style({
  borderLeft: `${ThemeVars.components.Cell.borderWidth} solid transparent`,
  borderRight: `${ThemeVars.components.Cell.borderWidth} solid transparent`,
});

export const CellClsVariants = styleVariants({
  shifting: {
    transition: 'left 300ms',
  },
  dragging: {
    transition: 'none',
  },
});
export const CellCls = style([
  CellBorderCls,
  {
    padding: ThemeVars.components.Cell.padding,
  },
  position.absolute,
  willChange.transform,
  whiteSpace.nowrap,
]);

const ColumnCellVariantsObject = {
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
export const ColumnCellVariants = styleVariants(ColumnCellVariantsObject);

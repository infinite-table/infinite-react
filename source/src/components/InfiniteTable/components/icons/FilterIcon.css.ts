import { style } from '@vanilla-extract/css';
import { ThemeVars } from '../../theme.css';
import {
  alignItems,
  display,
  flexFlow,
  justifyContent,
  position,
} from '../../utilities.css';

export const FilterIconCls = style([
  display.flex,
  flexFlow.column,
  position.relative,
  justifyContent.spaceAround,
  alignItems.center,
  {
    paddingBlockStart: '2px',
    paddingBlockEnd: '2px',
    minWidth: ThemeVars.components.HeaderCell.iconSize,
    height: ThemeVars.components.HeaderCell.iconSize,
  },
]);

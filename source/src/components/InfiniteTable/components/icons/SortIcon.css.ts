import { style } from '@vanilla-extract/css';
import { ThemeVars } from '../../theme.css';
import {
  display,
  flexFlow,
  justifyContent,
  position,
} from '../../utilities.css';

export const SortIconCls = style([
  display.flex,
  flexFlow.column,
  position.relative,
  justifyContent.spaceAround,
  {
    paddingBlockStart: '2px',
    paddingBlockEnd: '2px',
    minWidth: ThemeVars.components.HeaderCell.iconSize,
    height: ThemeVars.components.HeaderCell.iconSize,
  },
]);

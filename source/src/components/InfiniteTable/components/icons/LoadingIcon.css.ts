import { style } from '@vanilla-extract/css';
import { cursor, stroke, flex } from '../../utilities.css';

export const LoadingIconCls = style([
  stroke.accentColor,
  flex.none,
  cursor.pointer,
]);

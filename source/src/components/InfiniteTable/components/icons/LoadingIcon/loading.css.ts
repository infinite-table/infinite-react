import { style } from '@vanilla-extract/css';
import { cursor, stroke, flex } from '../../../utilities.css';
import { ThemeVars } from '../../../vars.css';

export const LoadingIconCls = style([
  stroke.accentColor,
  flex.none,
  cursor.pointer,
  {
    // only used by the custom icon layer (see Icon.css.ts) - the circle has fill="none"
    fill: ThemeVars.color.accent,
  },
]);

import { style } from '@vanilla-extract/css';
import { ThemeVars } from '../../theme.css';

export const FooterCls = style({
  padding: ThemeVars.spacing[2],
  position: 'relative',
});

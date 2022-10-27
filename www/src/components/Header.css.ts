import { globalStyle, style } from '@vanilla-extract/css';
import { display, maxWidth, padding, wwwVars } from '@www/styles/www-utils.css';
import { SpotlightHorizontalBackgroundCls } from './components.css';

export const NavBarWrapCls = style([
  {
    width: '100%',

    height: wwwVars.header.height,

    zIndex: 1000,
    position: 'relative',
  },
]);

export const IceCls = style([
  {
    position: 'fixed',
    top: -10,
    left: 0,
    right: 0,

    zIndex: -1,
    height: wwwVars.header.lineHeight,
    // width: wwwVars.maxSiteWidth,
    margin: '0 auto',
    selectors: {
      '&:before, &:after': {
        content: '""',
        position: 'absolute',
        inset: '-1px 0px -50%',
        pointerEvents: 'none',
        userSelect: 'none',
      },
      '&:before': {
        backdropFilter: 'blur(6px)',
        WebkitMaskImage: `linear-gradient(to bottom,black ${wwwVars.header.lineHeight},transparent)`,
      },
    },
  },
]);

export const UnderlineCls = style([
  {
    selectors: {
      '&::before': {
        content: '',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 1,
        background: wwwVars.color.specialBorderBolor,
      },
    },
  },
]);

export const OverlineCls = style([
  {
    selectors: {
      '&::before': {
        content: '',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        background: wwwVars.color.specialBorderBolor,
      },
    },
  },
]);
export const NavBarCls = style([
  SpotlightHorizontalBackgroundCls,
  UnderlineCls,
  {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    flexFlow: 'row',
    maxWidth: wwwVars.maxSiteWidth,
    width: '100%',
    alignItems: 'center',
    margin: '0 auto',
    // position: 'relative',

    zIndex: 1,
    lineHeight: wwwVars.header.lineHeight,
    color: wwwVars.header.color,
  },
]);

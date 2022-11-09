import { globalStyle, style, keyframes } from '@vanilla-extract/css';
import {
  centeredFlexColumn,
  centeredFlexRow,
  paddingX,
  screenSizes,
  wwwVars,
} from '@www/styles/www-utils.css';

export const width100 = style({
  width: '100%',
});

export const buttonPositionWithTransition = style({
  position: 'relative',
  bottom: 0,
  transition: '0.2s bottom',
  selectors: {
    '&:active': {
      bottom: 1,
    },
  },
});
export const footer = style([centeredFlexRow, width100]);

export const SpotlightHorizontalBackgroundCls = style([
  {
    backgroundImage: `radial-gradient(ellipse 100% 50% at 50% -20%,${wwwVars.color.brandDark},rgba(255,255,255,0))`,
  },
]);

export const GradientTextBackground = style([
  {
    color: 'transparent',
    backgroundImage: `linear-gradient(to right,${wwwVars.color.glow} 70%, ${wwwVars.color.brandDark})`,
    WebkitBackgroundClip: 'text',
  },
]);

const brandBlue = '#497AFF';
export const HighlightTextBackground = style([
  {
    color: 'transparent',
    backgroundImage: `linear-gradient(to right,${wwwVars.color.glow} 60%,${wwwVars.color.glow})`,
    WebkitBackgroundClip: 'text',
  },
]);

export const HighlightBrandToLightBackground = style([
  {
    color: 'transparent',

    // backgroundImage: `linear-gradient(to right,${wwwVars.color.highlight} 30%,${wwwVars.color.brandDark})`,
    // backgroundImage: `linear-gradient(to right,${wwwVars.color.glow} 1%, ${wwwVars.color.white} 80%,${wwwVars.color.white})`,
    backgroundImage: `linear-gradient(to right,${wwwVars.color.glow} 1%, ${brandBlue})`,
    WebkitBackgroundClip: 'text',
  },
]);

export const SpotlightRadialBackgroundCls = style([
  {
    pointerEvents: 'none',
    position: 'absolute',
    inset: 0,
    overflow: 'visible',
    selectors: {
      '&:before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        transform: 'translate3d(var(--spotlight-left, 0px), 0, 0)',
        backgroundImage: `conic-gradient(from 90deg at 100% 50%,${wwwVars.color.brandDark}, black)`,
        WebkitMaskImage: ` radial-gradient(50% 50% at center center, black, transparent);`,
      },
    },
  },
]);

export const DotsBackgroundCls = style([
  {
    vars: {
      '--dot-size': '1px',
      '--dot-color1': wwwVars.color.darkBg + '',
      '--dot-color2': wwwVars.color.darkBg + '',
      '--dot-black': wwwVars.color.black + '',
      '--dot-pattern-height': '750px',
    },
    background: `linear-gradient(180deg,transparent 0,${wwwVars.color.black} var(--dot-pattern-height)),
      fixed 0 0 /20px 20px radial-gradient(var(--dot-color1) var(--dot-size),transparent 0),
      fixed 10px 10px /20px 20px radial-gradient(var(--dot-color2) var(--dot-size),transparent 0
    )`,
  },
]);

const fadeUp = keyframes({
  '0%': { transform: 'translateY(0%)', opacity: 1 },
  '100%': { transform: 'translateY(100%)', opacity: 0 },
});
export const BannerTextAnimationCls = style([
  {
    animation: `var(--animation-duration) ${fadeUp} 2650ms ease-in-out infinite`,
  },
]);

const BannerTextCommon = style({
  transition: 'opacity 0.3s, top 0.3s',
  position: 'absolute',
});
export const BannerTextPrevCls = style([
  BannerTextCommon,
  {
    opacity: 0,
    top: '-30px',
    pointerEvents: 'none',
  },
]);
export const BannerTextCurrentCls = style([
  BannerTextCommon,
  { top: '0px', opacity: 1 },
]);

export const BannerTextNextCls = style([
  BannerTextCommon,
  {
    opacity: 0,
    top: '10px',
    pointerEvents: 'none',
  },
]);

export const HeroImageNormalCls = style([]);

export const HeroImageCls = style([
  {
    WebkitMaskImage: `radial-gradient(100% 80% at center center, ${wwwVars.color.black}, transparent);`,
    transform: `perspective(3050px)
    translate3d(0px, 0px, 250px)
    rotateX(27deg)
    scale(0.9, 0.9)`,
    borderRadius: 5,
    boxShadow: '0 70px 40px -20px rgba(0, 0, 0, 0.7)',
    // boxShadow: `0 70px 40px -20px ${wwwVars.color.highlight}`,
    transition: '0.5s ease-in-out transform',
    '@media': {
      [`screen and (max-width: ${screenSizes['screen-xl']})`]: {
        transform: `perspective(2050px)
          translate3d(0px, 0px, 50px)
          rotateX(27deg)
          scale(0.9, 0.9)`,
      },
    },
    selectors: {
      [`${HeroImageNormalCls}&, &:hover`]: {
        transform: `translate3d(0px, 0px, 0px)`,
        WebkitMaskImage: ``,
      },
    },
  },
]);

globalStyle(`${footer} img`, {
  marginLeft: '0.5rem',
});

globalStyle(`${footer} a`, {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const minHeightFull = style({
  minHeight: '100vh',
});

export const fullWidthContainer = style([centeredFlexColumn, width100]);
export const container = style([
  paddingX['3'],
  {
    width: '100%',
    maxWidth: '90vw',
  },
]);

export const submitButton = style({
  selectors: {
    '&:hover': {
      background: wwwVars.color.contentColor,
      color: wwwVars.color.brandDark,
    },
  },
  alignSelf: 'center',
});

globalStyle(`${submitButton}`, {
  transition:
    'color 0.35s ease, border-color 0.35s ease,background-color 0.35s ease',
});

export const title = style({
  lineHeight: 1.15,
});

globalStyle(`${title} a`, {
  textDecoration: 'none',
  textAlign: 'left',
});

globalStyle(`${title} a:hover`, {
  textDecoration: 'underline',
});
globalStyle(`${title} a:focus`, {
  textDecoration: 'underline',
});
globalStyle(`${title} a:active`, {
  textDecoration: 'underline',
});

export const grid = style({});

export const card = style({
  textAlign: 'left',
  textDecoration: 'none',
  position: 'relative',

  top: 0,
  selectors: {
    '&:hover': {
      top: '-2px',
    },
  },
});

// globalStyle(`${card} a:hover`, {
//   textDecoration: 'underline',
// });
globalStyle(`${card}`, {
  transition:
    'color 0.35s ease, border-color 0.35s ease,background-color 0.35s ease, top 0.25s ease',
});

globalStyle(`${card} h3`, {
  margin: '0 0 1rem 0',
  fontSize: '1.5rem',
});
globalStyle(`${card} p`, {
  margin: '0',
});

export const email = style({
  boxShadow:
    'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(59, 130, 246, 0.5) 0px 0px 0px 2px, rgba(0, 0, 0, 0) 0px 0px 0px 0px',
});

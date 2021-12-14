import {
  composeStyles,
  createTheme,
  CSSProperties,
  style,
  styleVariants,
} from '@vanilla-extract/css';

export const BRAND_COLOR_DEFAULT = '#0b6fcb';
export const BRAND_COLOR_DARK = '#133048';

export const screenSizes = {
  'screen-sm': '640px',
  'screen-md': '768px',
  'screen-lg': '1024px',
  'screen-xl': '1280px',
  'screen-2xl': '1536px',
};

export const colorVariables = {
  brand: BRAND_COLOR_DEFAULT,
  brandDark: BRAND_COLOR_DARK,
  blue: 'blue',
  blue700: '#1c4fd8',
  white: 'white',
  gray: '#eaeaea',
  errBackground: '#ffdcd5',
};

export const spaceScale = {
  auto: 'auto',
  0: '0px',
  '0.5': '0.125rem',
  1: '0.25rem',
  '1.5': '0.375rem',
  '2': '0.5rem',
  '2.5': '0.625rem',
  3: '0.75rem',
  '3.5': '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  '10': '2.5rem',
  '11': '2.75rem',
  '12': '3rem',
  '14': '3.5rem',
  '16': '4rem',
  '20': '5rem',
  '24': '6rem',
  '28': '7rem',
  '32': '8rem',
  '36': '9rem',
  '40': '10rem',
  '44': '11rem',
  '48': '12rem',
  '52': '13rem',
  '56': '14rem',
  '60': '15rem',
  '64': '16rem',
  '72': '18rem',
  '80': '20rem',
  '96': '24rem',
};

export const fontWeight = styleVariants(
  {
    bold: 'bold',
    normal: 'normal',
    inherit: 'inherit',
  },
  (value) => {
    return {
      fontWeight: value as CSSProperties['fontWeight'],
    };
  }
);

export const fontSizeScale = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  inherit: 'inherit',
  lg: '1.125rem',
  xl: '1.25rem',
  '1xl': '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '4rem',
};

export const fontSize = styleVariants(
  fontSizeScale,
  (value) => {
    return {
      fontSize: value,
    };
  }
);

export const maxWidth = styleVariants(
  {
    '0': '0rem',
    none: 'none',
    xs: '20rem',
    sm: '24rem',
    md: '28rem',
    lg: '32rem',
    xl: '36rem',
    '2xl': '42rem',
    '3xl': '48rem',
    '4xl': '56rem',
    '5xl': '64rem',
    '6xl': '72rem',
    '7xl': '80rem',
    '8xl': '95rem',
    full: '100%',
    min: 'min-content',
    max: 'max-content',
    prose: '65ch',
    ...screenSizes,
  },
  (value) => {
    return {
      maxWidth: value,
    };
  }
);

export const justifyContent = styleVariants(
  {
    center: 'center',
  },
  (value) => {
    return {
      justifyContent: 'center',
    };
  }
);

export const alignSelf = styleVariants(
  {
    flexStart: 'flex-start',
    flexEnd: 'flex-end',
    stretch: 'stretch',
  },
  (value) => {
    return {
      alignSelf: value as CSSProperties['alignSelf'],
    };
  }
);
export const textAlign = styleVariants(
  {
    center: 'center',
    left: 'left',
    right: 'right',
    justify: 'justify',
  },
  (value) => {
    return {
      textAlign: value as CSSProperties['textAlign'],
    };
  }
);

export const zIndexScale = {
  '0': 0,
  '10': 10,
  '20': 20,
  '30': 30,
  '40': 40,
  '50': 50,
  '75': 75,
  '100': 100,
  auto: 'auto',
};

export const zIndex = styleVariants(
  zIndexScale,
  (value) => {
    return {
      zIndex: value as CSSProperties['zIndex'],
    };
  }
);

export const [light, vars] = createTheme(
  {
    color: colorVariables,
    font: {
      body: `RobotoMono, sans-serif`,
      sizes: {
        small: '10px',
        medium: '16px',
        large: '20px',
        h1: '40px',
      },
    },
    space: spaceScale,
  },
  'light'
);

export const padding = styleVariants(
  spaceScale,
  (space) => {
    return {
      padding: space,
    };
  }
);

export const paddingLeft = styleVariants(
  spaceScale,
  (space) => {
    return {
      paddingLeft: space,
    };
  }
);
export const paddingRight = styleVariants(
  spaceScale,
  (space) => {
    return {
      paddingRight: space,
    };
  }
);

export const paddingY = styleVariants(
  spaceScale,
  (space) => {
    return {
      padding: `${space} 0`,
    };
  }
);

export const paddingX = styleVariants(
  spaceScale,
  (space) => {
    return {
      paddingLeft: `${space}`,
      paddingRight: `${space}`,
    };
  }
);

export const margin = styleVariants(spaceScale, (space) => {
  return {
    margin: space,
  };
});

export const marginX = styleVariants(
  spaceScale,
  (space) => {
    return {
      marginLeft: `${space}`,
      marginRight: `${space}`,
    };
  }
);

export const marginY = styleVariants(
  spaceScale,
  (space) => {
    return {
      margin: `${space} 0`,
    };
  }
);

export const marginBottom = styleVariants(
  spaceScale,
  (space) => {
    return {
      marginBottom: space,
    };
  }
);

export const marginLeft = styleVariants(
  spaceScale,
  (space) => {
    return {
      marginLeft: space,
    };
  }
);

export const marginRight = styleVariants(
  spaceScale,
  (space) => {
    return {
      marginRight: space,
    };
  }
);

export const marginTop = styleVariants(
  spaceScale,
  (space) => {
    return {
      marginTop: space,
    };
  }
);
export const top = styleVariants(spaceScale, (space) => {
  return {
    top: space,
  };
});
export const backgroundColorBrand = style({
  background: vars.color.brand,
});
export const backgroundColorBlue700 = style({
  background: vars.color.blue700,
});
export const backgroundColorBrandDark = style({
  background: vars.color.brandDark,
});

export const colorBrand = style({
  color: vars.color.brand,
});

export const colorWhite = style({
  color: vars.color.white,
});

export const colorBrandDark = style({
  color: vars.color.brandDark,
});

export const backgroundColorWhite = style({
  background: vars.color.white,
});

export const borderRadius = styleVariants(
  {
    none: '0',
    sm: '0.125rem',
    default: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  (value) => {
    return {
      borderRadius: value as CSSProperties['borderRadius'],
    };
  }
);

export const position = styleVariants(
  {
    relative: 'relative',
    absolute: 'absolute',
    static: 'static',
    sticky: 'sticky',
  },
  (value) => {
    return {
      position: value as CSSProperties['position'],
    };
  }
);

export const display = styleVariants(
  {
    flex: 'flex',
    block: 'block',
    inlineBlock: 'inline-block',
    inlineFlex: 'inline-flex',
    grid: 'grid',
  },
  (value) => {
    return {
      display: value as CSSProperties['display'],
    };
  }
);

export const flexDirection = styleVariants(
  {
    column: 'column',
    row: 'row',
    rowReverse: 'row-reverse',
    columnReverse: 'column-reverse',
  },
  (value) => {
    return {
      flexDirection:
        value as CSSProperties['flexDirection'],
    };
  }
);

export const flexWrap = styleVariants(
  {
    wrap: 'wrap',
    wrapReverse: 'wrap-reverse',
    nowrap: 'nowrap',
  },
  (value) => {
    return {
      flexWrap: value as CSSProperties['flexWrap'],
    };
  }
);

export const centeredFlexProps = style({
  justifyContent: 'center',
  alignItems: 'center',
});
export const centeredFlexColumn = composeStyles(
  display.flex,
  flexDirection.column,
  centeredFlexProps
);
export const centeredFlexRow = composeStyles(
  display.flex,
  flexDirection.row,
  centeredFlexProps
);

export const flex1 = style({
  flex: 1,
});

export const main = composeStyles(
  flexDirection.column,
  flex1,
  style({
    alignItems: 'center',
  })
);

export const shadow = styleVariants(
  {
    md: '0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)',
    lg: 'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
  },
  (value) => {
    return {
      boxShadow: value,
    };
  }
);

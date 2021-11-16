import { createGlobalThemeContract, globalStyle } from '@vanilla-extract/css';

export const ThemeVars = createGlobalThemeContract(
  {
    color: {
      accent: 'accent-color',
      color: 'color',
    },
    spacing: {
      0: 'space-0',
      1: 'space-1',
      2: 'space-2',
      3: 'space-3',
      4: 'space-4',
      5: 'space-5',
      6: 'space-6',
      7: 'space-7',
      8: 'space-8',
      9: 'space-9',
      10: 'space-10',
    },
    fontSize: {
      0: 'font-size-0',
      1: 'font-size-1',
      2: 'font-size-2',
      3: 'font-size-3',
      4: 'font-size-4',
      5: 'font-size-5',
      6: 'font-size-6',
      7: 'font-size-7',
    },
    fontFamily: 'font-family',
    minHeight: 'min-height',
    borderRadius: 'border-radius',

    components: {
      LoadMask: {
        padding: 'load-mask-padding',
        color: 'load-mask-color',
        textBackground: 'load-mask-text-background',
        overlayBackground: 'load-mask-overlay-background',
        overlayOpacity: 'load-mask-overlay-opacity',
        borderRadius: 'load-mask-border-radius',
      },
    },
  },
  (value: string | null) => `--infinite-${value}`,
);

// declare here vars that default to other vars
const LoadMaskVars = {
  [ThemeVars.components.LoadMask.textBackground]: 'rgba(255,255,255,0.8)',
  [ThemeVars.components.LoadMask.overlayBackground]: 'gray',
  [ThemeVars.components.LoadMask.overlayOpacity]: '0.3',
  [ThemeVars.components.LoadMask.color]: 'inherit',
  [ThemeVars.components.LoadMask.padding]: ThemeVars.spacing[5],
  [ThemeVars.components.LoadMask.borderRadius]: ThemeVars.borderRadius,
};

globalStyle(':root', {
  vars: {
    [ThemeVars.spacing[0]]: '0rem' /* 0px when 1rem=16px */,
    [ThemeVars.spacing[1]]: '0.125rem' /* 2px when 1rem=16px */,
    [ThemeVars.spacing[2]]: '0.25rem' /* 4px when 1rem=16px */,
    [ThemeVars.spacing[3]]: '0.5rem' /* 8px when 1rem=16px */,
    [ThemeVars.spacing[4]]: '0.75rem' /* 12px when 1rem=16px */,
    [ThemeVars.spacing[5]]: '1rem' /* 16px when 1rem=16px */,
    [ThemeVars.spacing[6]]: '1.25rem' /* 20px when 1rem=16px */,
    [ThemeVars.spacing[7]]: '1.5rem' /* 24px when 1rem=16px */,
    [ThemeVars.spacing[8]]: '2.25rem' /* 36px when 1rem=16px */,
    [ThemeVars.spacing[9]]: '3rem' /* 48px when 1rem=16px */,
    [ThemeVars.spacing[10]]: '4rem' /* 64px when 1rem=16px */,

    [ThemeVars.fontSize[0]]: '0.5rem' /* 8px when 1rem=16px */,
    [ThemeVars.fontSize[1]]: '0.625rem' /* 10px when 1rem=16px */,
    [ThemeVars.fontSize[2]]: '0.75rem' /* 12px when 1rem=16px */,
    [ThemeVars.fontSize[3]]: '0.875rem' /* 14px when 1rem=16px */,
    [ThemeVars.fontSize[4]]: '1rem' /* 16px when 1rem=16px */,
    [ThemeVars.fontSize[5]]: '1.25rem' /* 20px when 1rem=16px */,
    [ThemeVars.fontSize[6]]: '1.5rem' /* 24px when 1rem=16px */,
    [ThemeVars.fontSize[7]]: '2.25rem' /* 36px when 1rem=16px */,

    [ThemeVars.borderRadius]: ThemeVars.spacing[2],
    ...LoadMaskVars,
  },
});

import { fallbackVar } from '@vanilla-extract/css';
import { CSS_LOADED_VALUE, ThemeVars } from './vars.css';
// declare here vars that default to other vars
const LoadMaskVars = {
  [ThemeVars.components.LoadMask.textBackground]: 'rgba(255,255,255,0.8)',
  [ThemeVars.components.LoadMask.overlayBackground]: 'gray',
  [ThemeVars.components.LoadMask.overlayOpacity]: '0.3',
  [ThemeVars.components.LoadMask.color]: 'inherit',
  [ThemeVars.components.LoadMask.padding]: ThemeVars.spacing[5],
  [ThemeVars.components.LoadMask.borderRadius]: ThemeVars.borderRadius,
};

const HeaderCellVars = {
  [ThemeVars.components.HeaderCell.filterOperatorPaddingX]:
    ThemeVars.spacing['1'],
  [ThemeVars.components.HeaderCell.filterEditorPaddingX]:
    ThemeVars.spacing['2'],
  [ThemeVars.components.HeaderCell.filterEditorMarginX]: ThemeVars.spacing['1'],
  [ThemeVars.components.HeaderCell.filterOperatorPaddingY]:
    ThemeVars.spacing['0'],
  [ThemeVars.components.HeaderCell.filterEditorPaddingY]:
    ThemeVars.spacing['0'],
  [ThemeVars.components.HeaderCell.filterEditorMarginY]: ThemeVars.spacing['1'],
  [ThemeVars.components.HeaderCell.resizeHandleActiveAreaWidth]: '16px',
  [ThemeVars.components.HeaderCell.resizeHandleWidth]: '2px',
  [ThemeVars.components.HeaderCell.resizeHandleHoverBackground]:
    ThemeVars.color.accent,
  [ThemeVars.components.HeaderCell.resizeHandleConstrainedHoverBackground]:
    ThemeVars.color.error,
  [ThemeVars.components.HeaderCell.background]: '#ededed',
  [ThemeVars.components.HeaderCell.borderRight]:
    ThemeVars.components.Cell.border,
  [ThemeVars.components.HeaderCell.filterEditorBackground]:
    ThemeVars.components.Row.background,
  [ThemeVars.components.HeaderCell
    .filterEditorBorder]: `${ThemeVars.components.Cell.border}`,
  [ThemeVars.components.HeaderCell.filterEditorFocusBorderColor]:
    ThemeVars.color.accent,
  [ThemeVars.components.HeaderCell.border]: ThemeVars.components.Cell.border,
  [ThemeVars.components.HeaderCell.filterEditorColor]: `currentColor`,
  [ThemeVars.components.HeaderCell.filterEditorBorderRadius]:
    ThemeVars.borderRadius,
  [ThemeVars.components.HeaderCell.hoverBackground]: '#dfdfdf',
  [ThemeVars.components.HeaderCell.paddingX]: ThemeVars.spacing['3'],
  [ThemeVars.components.HeaderCell.paddingY]: ThemeVars.spacing['3'],
  [ThemeVars.components.HeaderCell
    .padding]: `${ThemeVars.components.HeaderCell.paddingY} ${ThemeVars.components.HeaderCell.paddingX} `,

  [ThemeVars.components.HeaderCell.iconSize]: '16px',
  [ThemeVars.components.HeaderCell.menuIconLineWidth]: '1px',
  [ThemeVars.components.HeaderCell.sortIconMargin]: '16px',
};
const HeaderVars = {
  [ThemeVars.components.Header.background]:
    ThemeVars.components.HeaderCell.background,
  [ThemeVars.components.Header.color]: '#6f6f6f',
  [ThemeVars.components.Header.columnHeaderHeight]: '30px',
};

const ActiveCellIndicatorVars = {
  [ThemeVars.components.ActiveCellIndicator.inset]:
    ThemeVars.components.Cell.borderWidth,
};

const CellVars = {
  [ThemeVars.components.Cell.color]: 'currentColor',
  [ThemeVars.components.Cell.borderWidth]: '1px',
  [ThemeVars.components.Cell.flashingOverlayZIndex]: -1,
  [ThemeVars.components.Cell
    .horizontalLayoutColumnReorderDisabledPageOpacity]: 0.3,
  [ThemeVars.components.Cell.flashingBackground]: ThemeVars.color.accent,
  [ThemeVars.components.Cell.flashingUpBackground]: ThemeVars.color.success,
  [ThemeVars.components.Cell.flashingDownBackground]: ThemeVars.color.error,
  [ThemeVars.components.Cell
    .padding]: `${ThemeVars.spacing[2]} ${ThemeVars.spacing[3]}`,
  [ThemeVars.components.Cell
    .border]: `${ThemeVars.components.Cell.borderWidth} solid #c6c6c6`,
  [ThemeVars.components.Cell
    .borderLeft]: `${ThemeVars.components.Cell.borderWidth} solid transparent`,
  [ThemeVars.components.Cell
    .borderRight]: `${ThemeVars.components.Cell.borderWidth} solid transparent`,

  [ThemeVars.components.Cell
    .pinnedBorder]: `${ThemeVars.components.Cell.borderWidth} solid #2a323d`,
  [ThemeVars.components.Cell.borderInvisible]: 'none',
  [ThemeVars.components.Cell.borderRadius]: ThemeVars.spacing[2],
  [ThemeVars.components.Cell.reorderEffectDuration]: '.2s',

  // [ThemeVars.components.Cell.selectedCellBorder]: '2px solid red',
  [ThemeVars.components.Cell.selectedBorderStyle]: 'solid',
  [ThemeVars.components.Cell.activeBorderStyle]: 'dashed',
  [ThemeVars.components.Cell.activeBorderWidth]: '1px',
  // [ThemeVars.components.Cell.activeBorderColor]: '#4d95d7',
  // [ThemeVars.components.Cell.activeBackground]: 'rgba(77, 149, 215, 0.25)',

  [ThemeVars.components.Cell.activeBackgroundAlpha]: '0.25',
  [ThemeVars.components.Cell.activeBackgroundAlphaWhenTableUnfocused]: '0.1',

  [ThemeVars.components.Cell.selectedBackgroundDefault]: fallbackVar(
    ThemeVars.components.Cell.selectedBackground,
    ThemeVars.components.Cell.activeBackground,
    `color-mix(in srgb, ${fallbackVar(
      ThemeVars.components.Cell.selectedBorderColor,
      ThemeVars.components.Cell.activeBorderColor,
      ThemeVars.components.Row.activeBorderColor,
      ThemeVars.color.accent,
    )}, transparent calc(100% - ${fallbackVar(
      ThemeVars.components.Cell.selectedBackgroundAlpha,
      ThemeVars.components.Cell.activeBackgroundAlpha,
      ThemeVars.components.Row.activeBackgroundAlpha,
    )} * 100%))`,
  ),

  [ThemeVars.components.Cell.activeBackgroundDefault]: fallbackVar(
    ThemeVars.components.Cell.activeBackground,
    `color-mix(in srgb, ${fallbackVar(
      ThemeVars.components.Cell.activeBorderColor,
      ThemeVars.color.accent,
    )}, transparent calc(100% - ${
      ThemeVars.components.Cell.activeBackgroundAlpha
    } * 100%))`,
  ),
};

const SelectionCheckBoxVars = {
  [ThemeVars.components.SelectionCheckBox
    .marginInline]: `${ThemeVars.spacing[2]}`,
};

const ExpandCollapseIconVars = {
  [ThemeVars.components.ExpandCollapseIcon.color]: ThemeVars.color.accent,
};

const RowVars = {
  [ThemeVars.components.Row.background]: ThemeVars.background,

  [ThemeVars.components.Row.oddBackground]: '#f6f6f6',
  [ThemeVars.components.Row.disabledOpacity]: '0.5',
  [ThemeVars.components.Row.disabledBackground]: '#eeeeee',
  [ThemeVars.components.Row.oddDisabledBackground]: '#f9f9f9',
  [ThemeVars.components.Row.selectedDisabledBackground]:
    ThemeVars.components.Row.selectedBackground,
  [ThemeVars.components.Row.selectedBackground]: '#d1e9ff',
  [ThemeVars.components.Row.selectedHoverBackground]: '#add8ff',
  [ThemeVars.components.Row.groupRowBackground]: '#cbc5c5',
  [ThemeVars.components.Row.groupRowColumnNesting]: '24px', // for best alignment, this should be the size of the group/tree icon
  [ThemeVars.components.Row.hoverBackground]: '#dbdbdb',
  [ThemeVars.components.Row.pointerEventsWhileScrolling]: 'auto',
};
const RowDetailsVars = {
  [ThemeVars.components.RowDetail.background]:
    ThemeVars.components.Row.hoverBackground,
  [ThemeVars.components.RowDetail.padding]: ThemeVars.spacing[2],
  [ThemeVars.components.RowDetail.gridHeight]: '100%',
};

const MenuVars = {
  [ThemeVars.components.Menu.background]: ThemeVars.background,
  [ThemeVars.components.Menu.color]: ThemeVars.components.Cell.color,
  [ThemeVars.components.Menu.separatorColor]: 'currentColor',
  [ThemeVars.components.Menu.padding]: ThemeVars.spacing[3],
  [ThemeVars.components.Menu.cellPaddingVertical]: ThemeVars.spacing[3],
  [ThemeVars.components.Menu.cellPaddingHorizontal]: ThemeVars.spacing[3],
  [ThemeVars.components.Menu.cellMarginVertical]: ThemeVars.spacing[0],
  [ThemeVars.components.Menu.itemDisabledBackground]:
    ThemeVars.components.Menu.background,
  [ThemeVars.components.Menu.itemDisabledOpacity]: 0.5,
  [ThemeVars.components.Menu.itemActiveBackground]:
    ThemeVars.components.Row.hoverBackground,
  [ThemeVars.components.Menu.itemPressedBackground]:
    ThemeVars.components.Row.hoverBackground,
  [ThemeVars.components.Menu.itemActiveOpacity]: 0.9,
  [ThemeVars.components.Menu.itemPressedOpacity]: 1,
  [ThemeVars.components.Menu.borderRadius]: ThemeVars.spacing[2],
  [ThemeVars.components.Menu.shadowColor]: `rgba(0,0,0,0.25)`,
};

export const LightVars = {
  [ThemeVars.loaded]: CSS_LOADED_VALUE,
  [ThemeVars.themeName]: 'default',
  [ThemeVars.themeMode]: 'light',
  [ThemeVars.iconSize]: '24px',
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

  [ThemeVars.fontFamily]: 'inherit',
  [ThemeVars.color.color]: '#484848',
  [ThemeVars.color.accent]: '#0284c7',
  [ThemeVars.color.success]: '#7aff7a',
  [ThemeVars.color.error]: '#ff0000',
  [ThemeVars.borderRadius]: ThemeVars.spacing[2],
  [ThemeVars.background]: 'white',
  [ThemeVars.minHeight]: '100px',

  ...SelectionCheckBoxVars,
  ...MenuVars,
  ...RowDetailsVars,
  ...LoadMaskVars,
  ...HeaderCellVars,
  ...HeaderVars,
  ...ActiveCellIndicatorVars,
  ...CellVars,
  ...RowVars,
  ...ExpandCollapseIconVars,
};

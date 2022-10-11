import { MutableRefObject } from 'react';
import { ComponentStateActions } from '../hooks/useComponentState/types';
import {
  MenuColumn,
  MenuProps,
  MenuRuntimeItem,
  MenuRuntimeItemSelectable,
} from './MenuProps';

export type MenuSetupState = {
  domRef: MutableRefObject<HTMLDivElement | null>;
  keyboardActiveItemKey: string | null;
  activeItemKey: string | null;
  generatedId: string;
  focused: boolean;
  destroyed: boolean;
};

export type MenuDerivedState = {
  runtimeItems: MenuRuntimeItem[];
  runtimeSelectableItems: MenuRuntimeItemSelectable[];
  columns: MenuColumn[];
  menuId: string;
};

export type MenuMappedState = {
  parentMenuId: MenuProps['parentMenuId'];
  parentMenuItemKey: MenuProps['parentMenuItemKey'];
  constrainTo: MenuProps['constrainTo'];
  autoFocus: MenuProps['autoFocus'];
  onHideIntent: MenuProps['onHideIntent'];
  onAction: MenuProps['onAction'];
  onShow: MenuProps['onShow'];
  onHide: MenuProps['onHide'];
  wrapLabels: MenuProps['wrapLabels'];
};

export interface MenuState
  extends MenuMappedState,
    MenuDerivedState,
    MenuSetupState {}

export type MenuActions = ComponentStateActions<MenuState>;

export type MenuApi = {
  focus: VoidFunction;
  getMenuId: () => string;
  getParentMenuId: () => string | undefined;
};
export type MenuComputedValues = {};
export type MenuRuntimeItemContext = {
  columns: MenuColumn[];
  keyboardActiveItemKey: string | null;
  activeItemKey: string | null;
  menuId: string;
};

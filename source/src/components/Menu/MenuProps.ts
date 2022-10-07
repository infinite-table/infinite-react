import { CSSProperties, HTMLProps } from 'react';
import { ElementContainerGetter, OverlayShowParams } from '../hooks/useOverlay';
import { NonUndefined } from '../types/NonUndefined';
import { RemoveObject } from '../types/RemoveObject';
import { Renderable } from '../types/Renderable';
import { MenuApi, MenuState } from './MenuState';

export type MenuRenderable = string | number | RemoveObject<Renderable>;

export type MenuRuntimeItemSelectable = {
  type: 'item';
  key: string;
  parentMenuId: string;
  active: boolean;
  keyboardActive: boolean;
  value: MenuItemObject;
  style?: CSSProperties;
  className?: string;
  disabled: boolean;
  span: number;
  menu: MenuProps | (() => MenuProps) | null;
  originalMenuItem: MenuItemObject;
};
export type MenuRuntimeItem =
  | MenuRuntimeItemSelectable
  | {
      type: 'decoration';
      value: MenuDecoration;
      style: CSSProperties;
      span: number;
    };

export type MenuChildrenFnParam = {
  item: MenuRuntimeItem;
  column: MenuColumn;
  columns: MenuColumn[];
};

export type MenuProps = {
  id?: string;
  portalContainer?: ElementContainerGetter | false | null;
  items?: MenuItemDefinition[];
  constrainTo?: OverlayShowParams['constrainTo'];
  columns?: MenuColumn[];
  children?: MenuRenderable;
  wrapLabels?: boolean;
  onShow?: (state: MenuState, api: MenuApi) => void;
  onHide?: (state: MenuState) => void;
  bubbleActionsFromSubmenus?: boolean;
  addSubmenuColumnIfNeeded?: boolean;
  onAction?: (key: string, item: MenuItemObject) => void;
  parentMenuId?: string;
  parentMenuItemKey?: string;
  autoFocus?: boolean;
};

export type MenuSeparator = '-';
export type MenuItemDefinition =
  | MenuItemObject
  | MenuDecoration
  | MenuSeparator;

type MenuItemSubMenu = Omit<MenuProps, 'children' | 'items'> & {
  items: (MenuItemObject | MenuSeparator)[];
};

export type MenuItemObject = {
  key: string;
  label: NonUndefined<MenuRenderable>;
  span?: number;
  description?: MenuRenderable;
  disabled?: boolean;
  menu?: MenuItemSubMenu | (() => MenuItemSubMenu);
  style?: CSSProperties;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  onAction?: (key: string, item: MenuItemObject) => void;
  [k: string]: any;
};

export type MenuDecoration = MenuRenderable;

export type MenuColumn = {
  flex?: number;
  width?: string | number;
  style?: CSSProperties;
  name: string;
  field?: string;
  render?: (param: MenuColumnRenderParam) => MenuRenderable;
};

export type MenuColumnRenderParam = {
  item: MenuItemObject;
  column: MenuColumn;
  value: MenuRenderable;
  domProps: HTMLProps<HTMLDivElement>;
};

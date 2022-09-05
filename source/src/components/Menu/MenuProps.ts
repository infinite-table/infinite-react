import { CSSProperties, HTMLProps } from 'react';
import { NonUndefined } from '../types/NonUndefined';
import { RemoveObject } from '../types/RemoveObject';
import { Renderable } from '../types/Renderable';

export type MenuRenderable = string | number | RemoveObject<Renderable>;

export type MenuRuntimeItemSelectable = {
  type: 'item';
  key: string;
  active: boolean;
  value: MenuItemObject;
  style?: CSSProperties;
  disabled: boolean;
  span: number;
  menu: MenuProps | null;
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
  items?: MenuItemDefinition[];
  columns?: MenuColumn[];
  children?: MenuRenderable;
  addSubmenuColumnIfNeeded?: boolean;
};

export type MenuSeparator = '-';
export type MenuItemDefinition =
  | MenuItemObject
  | MenuDecoration
  | MenuSeparator;

export type MenuItemObject = {
  key: string;
  label: NonUndefined<MenuRenderable>;
  span?: number;
  description?: MenuRenderable;
  disabled?: boolean;
  menu?: Omit<MenuProps, 'children' | 'items'> & {
    items: (MenuItemObject | MenuSeparator)[];
  };
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
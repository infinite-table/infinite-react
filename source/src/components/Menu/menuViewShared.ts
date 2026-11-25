/**
 * Framework-neutral parts of the Menu view, shared by the React Menu
 * (Menu.tsx), the Vue menu (MenuForVue.vue.ts) and the Angular menu
 * (MenuForAngular.angular.ts): the props of a submenu, where it is shown,
 * the submenu triangulation handlers, the menu grid style and the cells of
 * a menu row. Each menu renders the elements itself, from these.
 */
import { join } from '../../utils/join';
import { Rectangle } from '../../utils/pageGeometry/Rectangle';
import type { OverlayShowParams } from '../hooks/useOverlay/overlayUtils';

import { MenuItemCls } from './MenuCls.css';
import type {
  MenuColumn,
  MenuProps,
  MenuRuntimeItem,
  MenuRuntimeItemSelectable,
} from './MenuProps';
import type { MenuApi, MenuState } from './MenuState';
import { getMenuItemRect } from './menuDomUtils';
import { MenuTriangleContext } from './MenuTriangleContext';

/**
 * The item of `runtimeItems` with the given key, if it has a submenu.
 */
export function getActiveSubmenuItem(
  runtimeItems: MenuRuntimeItem[],
  activeItemKey: string | null,
): MenuRuntimeItemSelectable | null {
  const activeItem = runtimeItems.filter(
    (item) => item.type === 'item' && activeItemKey === item.key,
  )[0] as MenuRuntimeItemSelectable | null;

  return activeItem && activeItem.menu ? activeItem : null;
}

/**
 * Where the submenu of an item is shown: next to the item (null when the
 * item isn't rendered).
 */
export function getSubmenuOverlayParams(
  menuId: string,
  item: MenuRuntimeItemSelectable,
  constrainTo: MenuState['constrainTo'],
): OverlayShowParams | null {
  const alignTo = getMenuItemRect(menuId, item.key)!;

  if (!alignTo) {
    return null;
  }
  return {
    id: `${menuId}-submenu`,
    alignTo,
    alignPosition: [
      ['TopLeft', 'TopRight'],
      ['TopRight', 'TopLeft'],
    ],
    constrainTo,
  };
}

/**
 * The props of the submenu of an item (null when it has none): the item's
 * `menu` (an object, or a function returning it), shown without taking
 * the focus; when it hides while focused, the parent menu takes the focus
 * back, with the item keyboard-active.
 */
export function getSubmenuProps(
  item: MenuRuntimeItemSelectable,
  context: {
    parentMenuId: string;
    constrainTo: MenuState['constrainTo'];
    /** the parent menu's api */
    api: MenuApi;
    hideAll: VoidFunction;
    setSubmenuApi: (api: MenuApi) => void;
    setActiveItemKey: (key: string | null) => void;
    setKeyboardActiveItemKey: (key: string | null) => void;
  },
): MenuProps | null {
  const {
    parentMenuId,
    constrainTo,
    api,
    hideAll,
    setSubmenuApi,
    setActiveItemKey,
    setKeyboardActiveItemKey,
  } = context;

  let itemMenu = item.menu;
  if (!itemMenu) {
    return null;
  }

  if (typeof itemMenu === 'function') {
    itemMenu = itemMenu();
  }
  const submenu = itemMenu as MenuProps;

  return {
    parentMenuItemKey: item.key,
    parentMenuId,
    constrainTo: constrainTo as MenuProps['constrainTo'],
    ...submenu,
    autoFocus: false,
    onShow: (state: MenuState, submenuApi: MenuApi) => {
      submenu?.onShow?.(state, submenuApi);
      setSubmenuApi(submenuApi);
    },
    onHideIntent: (state: MenuState) => {
      submenu?.onHideIntent?.(state);
      hideAll();
    },
    onHide: (state: MenuState) => {
      if (state.focused) {
        // the submenu was focused but now is unmounted
        setActiveItemKey(null);
        setKeyboardActiveItemKey(item.key);
        // so make sure we focus current menu
        api.focus();
      }
    },
  };
}

/**
 * The pointer enter / leave handlers of the menu items, which open the
 * submenu of the hovered item - keeping the current one open while the
 * pointer moves towards it (MenuTriangleContext).
 */
export function createMenuTriangleHandlers(
  getState: () => MenuState,
  onItemActivate: (itemKey: string | null) => void,
) {
  return new MenuTriangleContext({
    parentMenuId: getState().parentMenuId,
    onItemActivate,
    itemHasSubMenu: (itemKey: string) => {
      const item = getState().runtimeItems.filter(
        (item) => item.type === 'item' && item.key === itemKey && item.menu,
      )[0];

      return !!item;
    },
    getMenuRectFor: (itemKey) => {
      const selector = `[data-submenu-for="${itemKey}"]`;
      const menuNode = document.querySelector(selector);
      if (!menuNode) {
        return undefined;
      }
      return Rectangle.from(menuNode.getBoundingClientRect());
    },
  }).getHandlers();
}

/**
 * The style of the menu element (a CSS grid with a column per menu column
 * and a row per item), on top of the given style.
 */
export function getMenuGridStyle(
  state: Pick<MenuState, 'columns' | 'runtimeItems' | 'wrapLabels'>,
  style: Record<string, any> | undefined,
  /** turns a column width into its CSS value */
  toCssWidth: (width: string | number) => string | number = (width) => width,
): Record<string, any> {
  const { columns, runtimeItems, wrapLabels } = state;

  const gridTemplateColumns = columns
    .map((col) => {
      return toCssWidth(
        col.width ||
          (typeof col.flex === 'number' ? `${col.flex}fr` : col.flex) ||
          'auto',
      );
    })
    .join(' ');

  const result: Record<string, any> = {
    ...style,
    gridTemplateColumns,
    gridTemplateRows: runtimeItems.map(() => `auto`).join(' '),
  };
  if (!wrapLabels) {
    result.whiteSpace = 'nowrap';
  }
  return result;
}

export type MenuItemCell = {
  /** the key of the cell element */
  key: string;
  column: MenuColumn;
  /** the item property the cell shows */
  value: any;
  style: Record<string, any>;
  className: string;
  dataAttributes: {
    'data-menu-column-id': string;
    'data-menu-col-name': string;
    'data-menu-row-id': string;
    'data-menu-row-index': string;
    'data-menu-item-key': string;
  };
};

/**
 * The cells of a menu item row: one per column, except the columns the
 * item spans over (`span`).
 */
export function getMenuItemCells(
  item: MenuRuntimeItemSelectable,
  columns: MenuColumn[],
  index: number,
  flags: { active: boolean; keyboardActive: boolean; pressed: boolean },
): MenuItemCell[] {
  const { active, keyboardActive, pressed } = flags;
  const key = item.value.key;

  const className = join(
    MenuItemCls({
      active,
      disabled: !!item.disabled,
      keyboardActive,
      pressed: pressed || active,
    }),
    item.className,
  );

  const cells: MenuItemCell[] = [];
  let spanIndex = 0;

  columns.forEach((col, i) => {
    const target = item.value;
    const field = col.field || col.name;
    const start = i + 1;
    const end = start + item.span;

    if (start < spanIndex) {
      return;
    }

    spanIndex = end;

    cells.push({
      key: `${key}-${field}`,
      column: col,
      value: (target as any)[field],
      style: {
        ...col.style,
        ...item.style,
        gridColumnStart: start,
        gridColumnEnd: end,
      },
      className,
      dataAttributes: {
        'data-menu-column-id': `${item.parentMenuId}-col-${col.name}`,
        'data-menu-col-name': `${col.name}`,
        'data-menu-row-id': `${item.parentMenuId}-row-${index}`,
        'data-menu-row-index': `${index}`,
        'data-menu-item-key': `${item.key}`,
      },
    });
  });

  return cells;
}

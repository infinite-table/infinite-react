/**
 * Framework-neutral menu state logic, shared by the React Menu
 * (getMenuState.tsx) and the Vue Menu (MenuForVue.vue.ts).
 *
 * The only framework-bound bits in the menu state derivation are the two
 * rendered nodes: the separator decoration and the submenu-indicator column.
 * Both are injected via the `MenuRenderAdapters` param.
 */
import { getChangeDetect } from '../DataSource/privateHooks/getChangeDetect';
import {
  MenuColumn,
  MenuItemDefinition,
  MenuItemObject,
  MenuProps,
  MenuRuntimeItem,
  MenuRuntimeItemSelectable,
} from './MenuProps';
import {
  MenuDerivedState,
  MenuRuntimeItemContext,
  MenuSetupState,
} from './MenuState';

const SUBMENU_COL_NAME = 'submenu';
const SEPARATOR: MenuItemDefinition = '-';

export type MenuRenderAdapters = {
  /** returns the rendered separator node (React: <hr/>, Vue: h('hr')) */
  renderSeparator: () => any;
  /** returns the render fn for the auto-added submenu indicator column */
  renderSubmenuColumn: MenuColumn['render'];
};

export function getInitialMenuStateShared(): MenuSetupState {
  return {
    keyboardActiveItemKey: null,
    activeItemKey: null,
    generatedId: getChangeDetect(),
    focused: false,
    destroyed: false,
    domRef: { current: null },
  };
}

export function forwardMenuProps() {
  return {
    parentMenuId: 1,
    parentMenuItemKey: 1,
    onHideIntent: 1,
    constrainTo: 1,
    onAction: 1,
    onShow: 1,
    onHide: 1,
    autoFocus: 1,
    wrapLabels: 1,
  } as const;
}

export const toRuntimeItemShared = (
  {
    columns,
    keyboardActiveItemKey,
    activeItemKey,
    menuId,
  }: MenuRuntimeItemContext,
  item: MenuItemDefinition,
  adapters: MenuRenderAdapters,
): MenuRuntimeItem => {
  const menuItem =
    item &&
    ((item as MenuItemObject).key != null ||
      (item as MenuItemObject).label != null)
      ? (item as MenuItemObject)
      : null;

  const menuDecoration =
    menuItem === null
      ? item === SEPARATOR
        ? adapters.renderSeparator()
        : item
      : null;

  const runtimeItem: MenuRuntimeItem =
    menuItem != null
      ? {
          type: 'item',
          parentMenuId: menuId,
          disabled: !!menuItem.disabled,
          keyboardActive: menuItem.key === keyboardActiveItemKey,
          active: menuItem.key === activeItemKey,
          value: menuItem,
          span: menuItem.span || 1,
          key: menuItem.key,
          menu: menuItem.menu || null,
          style: menuItem.style,
          className: menuItem.className,
          originalMenuItem: menuItem,
        }
      : {
          type: 'decoration',
          value: menuDecoration,
          span: columns.length,
          style: {
            gridColumnStart: 1,
            gridColumnEnd: columns.length + 10, // it should have been +1, but we might introduce an additional col for submenu icons
            // so we make this bigger
          },
        };

  return runtimeItem;
};

const defaultColumns: MenuColumn[] = [
  {
    name: 'label',
  },
];

export const deriveMenuStateShared = (
  params: {
    props: MenuProps;
    state: MenuSetupState & Partial<MenuDerivedState>;
  },
  adapters: MenuRenderAdapters & {
    /**
     * converts props.children into runtime items when no `items` prop is
     * given. React iterates React children; Vue passes undefined (Vue menus
     * are items-driven).
     */
    childrenToRuntimeItems?: (
      context: MenuRuntimeItemContext,
      children: any,
    ) => MenuRuntimeItem[];
  },
): MenuDerivedState => {
  const { props, state } = params;
  const { activeItemKey, keyboardActiveItemKey } = state;
  const { items, children, addSubmenuColumnIfNeeded, parentMenuId } = props;

  let menuId = props.id || state.generatedId;

  if (parentMenuId) {
    menuId = `${parentMenuId}-${menuId}`;
  }

  const columns: MenuColumn[] = [...(props.columns || defaultColumns)];
  const context: MenuRuntimeItemContext = {
    columns,
    keyboardActiveItemKey: keyboardActiveItemKey ?? null,
    activeItemKey: activeItemKey ?? null,
    menuId,
  };

  let runtimeItems: MenuRuntimeItem[] = [];
  if (items) {
    runtimeItems = items.map((item) =>
      toRuntimeItemShared(context, item, adapters),
    );
  } else if (!items && typeof children !== 'function') {
    runtimeItems = adapters.childrenToRuntimeItems
      ? adapters.childrenToRuntimeItems(context, children)
      : [];
  }

  if (addSubmenuColumnIfNeeded) {
    const hasSubmenus =
      runtimeItems.filter((item) => item.type === 'item' && item.menu != null)
        .length > 0;

    if (hasSubmenus && !columns.find((col) => col.name == SUBMENU_COL_NAME)) {
      columns.push({
        name: SUBMENU_COL_NAME,
        render: adapters.renderSubmenuColumn,
      });
    }
  }

  const runtimeSelectableItems = runtimeItems.filter(
    (item) => item.type === 'item' && !item.disabled,
  ) as MenuRuntimeItemSelectable[];

  return {
    runtimeItems,
    runtimeSelectableItems,
    columns,
    menuId,
  };
};

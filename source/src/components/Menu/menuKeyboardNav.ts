/**
 * Framework-neutral keyboard navigation, item actions and focus handling of
 * the Menu component, shared by the React Menu (Menu.tsx), the Vue menu
 * (MenuForVue.vue.ts) and the Angular menu (MenuForAngular.angular.ts).
 *
 * Each menu passes its state getter and setters; what differs between the
 * frameworks stays in the menus (e.g. the Angular menu defers its blur).
 */
import { raf } from '../../utils/raf';

import type { MenuRuntimeItemSelectable } from './MenuProps';
import type { MenuApi, MenuState } from './MenuState';
import { getFirstCheckBoxInsideMenuItem } from './menuDomUtils';

export type MenuItemClickContext = {
  getState: () => MenuState;
  setActiveItemKey: (key: string | null) => void;
  setKeyboardActiveItemKey: (key: string | null) => void;
  /** hides this menu and its parent menus */
  hideAll: VoidFunction;
};

export type MenuKeyboardNavContext = {
  getState: () => MenuState;
  setActiveItemKey: (key: string | null) => void;
  setKeyboardActiveItemKey: (key: string | null) => void;
  /** hides this menu (a submenu: ArrowLeft / Escape) */
  destroy: VoidFunction;
  /** the api of the submenu this menu shows, if any */
  getSubmenuApi: () => MenuApi | null;
  isMounted: () => boolean;
  onItemClick: (event: KeyboardEvent, item: MenuRuntimeItemSelectable) => void;
};

/**
 * Hides the menu and its parent menus (the root menu's `onHideIntent`).
 */
export function hideMenuAndParents(getState: () => MenuState) {
  const state = getState();
  state.onHideIntent?.(state);
}

/**
 * A click on a menu item (or Enter / Space on the keyboard-active one):
 * activates it, then calls its `onClick` and `onAction`, the menu's
 * `onAction`, and hides the menus when the item has `hideMenuOnAction`.
 */
export function runMenuItemClick(
  event: any,
  item: MenuRuntimeItemSelectable,
  context: MenuItemClickContext,
) {
  const { getState, setActiveItemKey, setKeyboardActiveItemKey, hideAll } =
    context;

  setKeyboardActiveItemKey(item.key);
  setActiveItemKey(item.key);

  if (item.originalMenuItem.onClick) {
    item.originalMenuItem.onClick(event);
  }
  const onActionParam = {
    key: item.key,
    item: item.originalMenuItem,
    hideMenu: hideAll,
  };
  if (item.originalMenuItem.onAction) {
    item.originalMenuItem.onAction(onActionParam);
  }
  const { onAction } = getState();
  if (onAction) {
    onAction(onActionParam);
  }

  if (item.originalMenuItem.hideMenuOnAction) {
    hideAll();
  }
}

/**
 * The keydown handler of a menu: ArrowUp / ArrowDown / Home / End / PageUp /
 * PageDown move the keyboard-active item, ArrowRight opens (and focuses)
 * the submenu of the keyboard-active item, ArrowLeft closes this menu when
 * it is a submenu, Enter toggles a submenu or runs the item, Space runs the
 * item and toggles the checkbox inside it, Escape closes this menu (and
 * asks the root menu to hide).
 */
export function handleMenuKeyDown(
  keyboardEvent: KeyboardEvent,
  context: MenuKeyboardNavContext,
) {
  const {
    getState,
    setActiveItemKey,
    setKeyboardActiveItemKey,
    destroy,
    getSubmenuApi,
    isMounted,
    onItemClick,
  } = context;

  const { runtimeItems, runtimeSelectableItems, keyboardActiveItemKey } =
    getState();
  const keyboardActiveIndex = runtimeItems.findIndex(
    (runtimeItem) =>
      runtimeItem.type === 'item' && runtimeItem.key === keyboardActiveItemKey,
  );

  let newKeyboardActiveItemKey = keyboardActiveItemKey;

  const keyboardActiveItem = runtimeItems[
    keyboardActiveIndex
  ] as MenuRuntimeItemSelectable;

  const validKeys = {
    ArrowUp: () => {
      const newActiveItem = runtimeItems
        .slice(0, keyboardActiveIndex)
        .filter((item) => item.type === 'item' && !item.disabled)
        .pop();
      if (newActiveItem && newActiveItem.type === 'item' && newActiveItem.key) {
        newKeyboardActiveItemKey = newActiveItem.key;
      }
    },
    ArrowDown: () => {
      const newActiveItem = runtimeItems
        .slice(keyboardActiveIndex + 1)
        .filter((item) => item.type === 'item' && !item.disabled)[0];

      if (newActiveItem && newActiveItem.type === 'item' && newActiveItem.key) {
        newKeyboardActiveItemKey = newActiveItem.key;
      }
    },
    Home: () => {
      validKeys.PageUp();
    },
    End: () => {
      validKeys.PageDown();
    },
    PageUp: () => {
      newKeyboardActiveItemKey = runtimeSelectableItems[0].key;
    },
    PageDown: () => {
      newKeyboardActiveItemKey =
        runtimeSelectableItems[runtimeSelectableItems.length - 1].key;
    },
    ArrowLeft: () => {
      setActiveItemKey(null);

      // if we're in a submenu, we want to hide it (destroy it)
      if (getState().parentMenuId) {
        destroy();
      }
    },

    ArrowRight: () => {
      if (!keyboardActiveItem) {
        return;
      }
      setActiveItemKey(keyboardActiveItem.key);

      raf(() => {
        const submenuApi = getSubmenuApi();
        if (
          isMounted() &&
          submenuApi &&
          submenuApi.getParentMenuId() === getState().menuId
        ) {
          submenuApi.focus();
        }
      });
    },
    Enter: () => {
      if (!keyboardActiveItem) {
        return;
      }
      if (keyboardActiveItem.originalMenuItem?.menu) {
        // we close it if it was opened
        if (getSubmenuApi()) {
          validKeys.ArrowLeft();
          return;
        }
        // or open if it was closed
        setActiveItemKey(keyboardActiveItem.key);
      } else {
        onItemClick(keyboardEvent, keyboardActiveItem);
      }
    },
    ' ': () => {
      if (!keyboardActiveItem) {
        return;
      }
      if (!keyboardActiveItem.originalMenuItem.menu) {
        onItemClick(keyboardEvent, keyboardActiveItem);
      }

      const checkbox = getFirstCheckBoxInsideMenuItem(
        getState().menuId,
        keyboardActiveItem.key,
      );
      if (!checkbox) {
        return;
      }

      checkbox.click();
    },
    Escape: () => {
      validKeys.ArrowLeft();

      const state = getState();

      if (!state.parentMenuId) {
        // this is a root menu, so make known to the parent that
        // it should possibly be hidden/destroyed on Escape
        state.onHideIntent?.(state);
      }
    },
  };

  const fn = validKeys[keyboardEvent.key as keyof typeof validKeys];

  if (fn) {
    fn();
    keyboardEvent.preventDefault();
  }
  if (newKeyboardActiveItemKey != keyboardActiveItemKey) {
    setKeyboardActiveItemKey(newKeyboardActiveItemKey);
  }
}

/**
 * The focus handling of a menu and its api.
 *
 * `onMenuFocus` is the focus handler of the menu element: it marks the
 * menu focused and, a tick later, makes the first selectable item
 * keyboard-active if none is - unless `shouldSelectFirstItemOnFocus()`
 * says the focus comes from a mousedown on an item (selecting the first
 * item and then the clicked one would flicker).
 */
export function createMenuFocus(context: {
  getState: () => MenuState;
  setFocused: (focused: boolean) => void;
  setKeyboardActiveItemKey: (key: string | null) => void;
  shouldSelectFirstItemOnFocus: () => boolean;
  hideAll: VoidFunction;
}): { api: MenuApi; onMenuFocus: VoidFunction } {
  const {
    getState,
    setFocused,
    setKeyboardActiveItemKey,
    shouldSelectFirstItemOnFocus,
    hideAll,
  } = context;

  const onMenuFocus = () => {
    setFocused(true);

    // we're using a special lazy focus (we consider shouldSelectFirstItemOnFocus), as the user might be actually clicking a menu item
    // directly and in this case, we would end up with a flicker
    // as we would select the first item and then the corresponding clicked
    // item would be selected - so we're using shouldSelectFirstItemOnFocus
    // which is adjusted on mousedown/up to prevent this flicker
    setTimeout(() => {
      // if it's still focused
      const domNode = getState().domRef.current;
      if (
        shouldSelectFirstItemOnFocus() &&
        domNode &&
        domNode === document.activeElement &&
        getState().keyboardActiveItemKey == null
      ) {
        setKeyboardActiveItemKey(
          getState().runtimeSelectableItems[0]?.key ?? null,
        );
      }
    });
  };

  const api: MenuApi = {
    hideMenu: hideAll,
    focus: () => {
      const domNode = getState().domRef.current as HTMLElement | null;
      if (domNode) {
        domNode.focus();

        setTimeout(() => {
          // sometimes the above focus does not work
          // so we try it again
          const node = getState().domRef.current as HTMLElement | null;
          if (node && node !== document.activeElement) {
            node.focus();
          }
        }, 10);

        // for whatever reason
        // when doing arrow left navigation from a third level menu
        // to a second level and then to a root menu
        // the onMenuFocus fn does not get called for the root menu
        // so we're calling it explicitly here
        onMenuFocus();
      }
    },
    getMenuId: () => getState().menuId,
    getParentMenuId: () => getState().parentMenuId,
  };

  return { api, onMenuFocus };
}

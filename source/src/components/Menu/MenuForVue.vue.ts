/**
 * Vue sibling of the Menu component (Menu.tsx + index.tsx).
 *
 * The state machine (runtime items derivation, controlled/uncontrolled
 * props) is the shared managed-component system + menuStateShared.ts; the
 * submenu triangulation logic is the shared MenuTriangleContext; alignment
 * comes through the Vue useOverlay sibling. This file owns the Vue render
 * tree: the CSS-grid menu, item rows, keyboard navigation and submenu
 * spawning — same DOM structure, classnames and data attributes as React.
 *
 * Note: Vue menus are items-driven (`items` prop); declaring items as
 * children (React's <MenuItem/> JSX) is not supported.
 */
import { defineComponent, h, onBeforeUnmount, ref, watch } from 'vue';
import type { PropType, VNodeChild } from 'vue';

import { join } from '../../utils/join';
import { raf } from '../../utils/raf';
import { Rectangle } from '../../utils/pageGeometry/Rectangle';

import { display } from '../InfiniteTable/utilities.css';
import { ExpandCollapseIcon } from '../InfiniteTable/components/icons/ExpandCollapseIconForVue.vue';

import { buildManagedVueComponent } from '../hooks/useComponentState/useManagedComponent.vue';
import { useOverlay } from '../hooks/useOverlay/useOverlayForVue.vue';

import {
  MenuCls,
  MenuItemCls,
  MenuRowCls,
  MenuSeparatorCls,
} from './MenuCls.css';
import type {
  MenuColumn,
  MenuProps,
  MenuRuntimeItem,
  MenuRuntimeItemSelectable,
} from './MenuProps';
import type { MenuApi, MenuState } from './MenuState';
import {
  deriveMenuStateShared,
  forwardMenuProps,
  getInitialMenuStateShared,
  type MenuRenderAdapters,
} from './menuStateShared';
import {
  getFirstCheckBoxInsideMenuItem,
  getMenuItemRect,
} from './menuDomUtils';
import { MenuTriangleContext } from './MenuTriangleContext';
import { propToIdentifyMenu } from './propToIdentifyMenu';

const vueMenuRenderAdapters: MenuRenderAdapters = {
  renderSeparator: () => h('hr', { class: MenuSeparatorCls }),
  renderSubmenuColumn: (({ domProps, item }: any) => {
    return item.menu
      ? h('div', domProps, [h(ExpandCollapseIcon, { expanded: false })])
      : h('div', domProps);
  }) as MenuColumn['render'],
};

const { useManagedComponent: useManagedMenu } = buildManagedVueComponent({
  // @ts-ignore
  initSetupState: getInitialMenuStateShared,
  // @ts-ignore
  forwardProps: () => forwardMenuProps(),
  // @ts-ignore
  mapPropsToState: (params: any) =>
    deriveMenuStateShared(params, vueMenuRenderAdapters),
  debugName: 'Menu',
});

/**
 * Vue port of RuntimeItemRenderer: one menu row — a cell per column, all
 * inside a display:contents row so the parent grid lays them out.
 */
const RuntimeItemRenderer = defineComponent({
  name: 'MenuRuntimeItem',
  props: {
    columns: { type: Array as PropType<MenuColumn[]>, required: true },
    item: { type: Object as PropType<MenuRuntimeItem>, required: true },
    index: { type: Number, required: true },
    active: { type: Boolean, required: true },
    keyboardActive: { type: Boolean, required: true },
    onItemEnter: {
      type: Function as PropType<
        (item: MenuRuntimeItemSelectable, event: PointerEvent) => void
      >,
      required: false,
    },
    onItemLeave: {
      type: Function as PropType<
        (item: MenuRuntimeItemSelectable, event: PointerEvent) => void
      >,
      required: false,
    },
    onItemClick: {
      type: Function as PropType<
        (event: MouseEvent, item: MenuRuntimeItemSelectable) => void
      >,
      required: true,
    },
  },
  setup(props) {
    const pressed = ref(false);

    return () => {
      const { columns, item, index, active, keyboardActive } = props;
      const key = item.type === 'item' ? item.value.key : index;

      let content: VNodeChild = null;

      if (item.type === 'decoration') {
        content = h('div', { style: item.style as any }, [
          item.value as VNodeChild,
        ]);
      } else {
        let spanIndex = 0;
        content = columns
          .map((col, i) => {
            const target = item.value;
            const field = col.field || col.name;
            const start = i + 1;
            const end = start + item.span;

            if (start < spanIndex) {
              return null;
            }

            spanIndex = end;
            const style = {
              ...col.style,
              ...item.style,
              gridColumnStart: start,
              gridColumnEnd: end,
            };

            const domProps: Record<string, any> = {
              style,
              'data-menu-column-id': `${item.parentMenuId}-col-${col.name}`,
              'data-menu-col-name': `${col.name}`,
              'data-menu-row-id': `${item.parentMenuId}-row-${index}`,
              'data-menu-row-index': `${index}`,
              'data-menu-item-key': `${item.key}`,
              class: join(
                MenuItemCls({
                  active,
                  disabled: !!item.disabled,
                  keyboardActive,
                  pressed: pressed.value || active,
                }),
                item.className,
              ),
              onPointerenter: (event: PointerEvent) => {
                if (!item.disabled) {
                  props.onItemEnter?.(item, event);
                }
              },
              onPointerleave: (event: PointerEvent) => {
                if (!item.disabled) {
                  props.onItemLeave?.(item, event);
                }
              },
              onMousedown: () => {
                if (!item.disabled) {
                  pressed.value = true;
                }
              },
              onMouseup: () => {
                if (!item.disabled) {
                  pressed.value = false;
                }
              },
              onClick: (event: MouseEvent) => {
                if (!item.disabled) {
                  props.onItemClick(event, item);
                }
              },
            };

            if (col.render) {
              return (col.render as any)({
                item: target,
                column: col,
                value: (target as any)[field],
                domProps,
              }) as VNodeChild;
            }

            return h('div', { key: `${key}-${field}`, ...domProps }, [
              (target as any)[field] as VNodeChild,
            ]);
          })
          .filter(Boolean) as VNodeChild;
      }

      return h('div', { class: MenuRowCls }, [content]);
    };
  },
});

export const Menu = defineComponent({
  name: 'InfiniteMenu',
  inheritAttrs: false,
  props: {
    id: { type: String, required: false },
    items: { type: Array as PropType<MenuProps['items']>, required: false },
    columns: {
      type: Array as PropType<MenuColumn[]>,
      required: false,
      default: undefined,
    },
    portalContainer: {
      type: [String, Object, Function, Boolean] as PropType<
        MenuProps['portalContainer']
      >,
      required: false,
      default: undefined,
    },
    constrainTo: {
      type: [String, Object, Function, Boolean] as PropType<
        MenuProps['constrainTo']
      >,
      required: false,
      default: undefined,
    },
    wrapLabels: { type: Boolean, required: false, default: false },
    autoFocus: { type: Boolean, required: false, default: undefined },
    addSubmenuColumnIfNeeded: {
      type: Boolean,
      required: false,
      default: true,
    },
    bubbleActionsFromSubmenus: {
      type: Boolean,
      required: false,
      default: true,
    },
    parentMenuId: { type: String, required: false },
    parentMenuItemKey: { type: String, required: false },
    onShow: {
      type: Function as PropType<MenuProps['onShow']>,
      required: false,
    },
    onHide: {
      type: Function as PropType<MenuProps['onHide']>,
      required: false,
    },
    onHideIntent: {
      type: Function as PropType<MenuProps['onHideIntent']>,
      required: false,
    },
    onAction: {
      type: Function as PropType<MenuProps['onAction']>,
      required: false,
    },
  },
  setup(props, { attrs }) {
    const { contextValue } = useManagedMenu(props as any);

    const state = contextValue.state;
    const componentActions = contextValue.componentActions as any;
    const getState = () => state.value as MenuState;

    const setKeyboardActiveItemKey = (key: string | null) => {
      componentActions.keyboardActiveItemKey = key;
    };
    const setActiveItemKey = (key: string | null) => {
      componentActions.activeItemKey = key;
    };

    let mounted = false;
    const isMounted = () => mounted;

    let submenuApi: MenuApi | null = null;
    const setSubmenuApi = (api: MenuApi | null) => {
      submenuApi = api;
    };

    const {
      showOverlay,
      portal: SubmenuPortal,
      clearAll,
    } = useOverlay({
      // all submenus will be displayed inside this menu
      // so when the parent menu is moved, the submenus are also moved
      portalContainer: false,
    });

    const hideAll = () => {
      const state = getState();
      state.onHideIntent?.(state);
    };

    const onMenuFocus = () => {
      componentActions.focused = true;

      // we're using a special lazy focus (we consider
      // shouldSelectFirstItemOnFocus), as the user might be actually
      // clicking a menu item directly - in that case selecting the first
      // item and then the clicked item would flicker
      setTimeout(() => {
        const domNode = getState().domRef.current;
        if (
          shouldSelectFirstItemOnFocus &&
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

    const onMenuBlur = () => {
      componentActions.focused = false;
    };

    let shouldSelectFirstItemOnFocus = true;

    const api: MenuApi = {
      hideMenu: hideAll,
      focus: () => {
        const domNode = getState().domRef.current;
        if (domNode) {
          (domNode as HTMLElement).focus();

          setTimeout(() => {
            // sometimes the above focus does not work, so try again
            const node = getState().domRef.current as HTMLElement | null;
            if (node && node !== document.activeElement) {
              node.focus();
            }
          }, 10);

          // when doing arrow-left navigation from a third-level menu to a
          // second level and then to a root menu, the focus event may not
          // fire for the root menu - so call it explicitly
          onMenuFocus();
        }
      },
      getMenuId: () => getState().menuId,
      getParentMenuId: () => getState().parentMenuId,
    };

    const onItemClick = (
      event: MouseEvent | KeyboardEvent,
      item: MenuRuntimeItemSelectable,
    ) => {
      setKeyboardActiveItemKey(item.key);
      setActiveItemKey(item.key);

      if (item.originalMenuItem.onClick) {
        item.originalMenuItem.onClick(event as any);
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
    };

    // ---- submenu triangulation (shared MenuTriangleContext) ----
    const { onItemEnter, onItemLeave } = new MenuTriangleContext({
      parentMenuId: getState().parentMenuId,
      onItemActivate: (itemKey: string | null) => {
        if (!isMounted()) {
          return;
        }
        setActiveItemKey(itemKey);
      },
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

    // ---- submenu spawning: mirrors the useLayoutEffect on activeItemKey ----
    const renderSubmenuForItem = (item: MenuRuntimeItemSelectable) => {
      const parentMenuId = getState().menuId;
      const overlayId = `${parentMenuId}-submenu`;

      let itemMenu = item.menu;
      if (!itemMenu) {
        return null;
      }
      if (typeof itemMenu === 'function') {
        itemMenu = itemMenu();
      }

      return h(Menu, {
        key: overlayId,
        parentMenuItemKey: item.key,
        parentMenuId,
        constrainTo: getState().constrainTo as any,
        ...(itemMenu as MenuProps),
        autoFocus: false,
        onShow: (state: MenuState, submenuApi: MenuApi) => {
          (itemMenu as MenuProps)?.onShow?.(state, submenuApi);
          setSubmenuApi(submenuApi);
        },
        onHideIntent: (state: MenuState) => {
          (itemMenu as MenuProps)?.onHideIntent?.(state);
          hideAll();
        },
        onHide: (state: MenuState) => {
          if (state.focused) {
            // the submenu was focused but now is unmounted
            setActiveItemKey(null);
            setKeyboardActiveItemKey(item.key);
            // so make sure we focus the current menu
            api.focus();
          }
        },
      } as any);
    };

    watch(
      () => state.value.activeItemKey,
      (activeItemKey) => {
        const { runtimeItems, menuId, constrainTo } = getState();

        const activeItem = runtimeItems.filter(
          (item) => item.type === 'item' && activeItemKey === item.key,
        )[0] as MenuRuntimeItemSelectable | null;

        if (!activeItem || !activeItem.menu) {
          setSubmenuApi(null);
          clearAll();
          return;
        }

        const alignTo = getMenuItemRect(menuId, activeItem.key)!;

        if (alignTo) {
          showOverlay(() => renderSubmenuForItem(activeItem), {
            id: `${menuId}-submenu`,
            alignTo,
            alignPosition: [
              ['TopLeft', 'TopRight'],
              ['TopRight', 'TopLeft'],
            ],
            constrainTo,
          });
        }
      },
      { flush: 'post' },
    );

    // ---- keyboard navigation (ported verbatim from Menu.tsx) ----
    function handleKeydown(keyboardEvent: KeyboardEvent) {
      const { runtimeItems, runtimeSelectableItems, keyboardActiveItemKey } =
        getState();
      const keyboardActiveIndex = runtimeItems.findIndex(
        (runtimeItem) =>
          runtimeItem.type === 'item' &&
          runtimeItem.key === keyboardActiveItemKey,
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
          if (
            newActiveItem &&
            newActiveItem.type === 'item' &&
            newActiveItem.key
          ) {
            newKeyboardActiveItemKey = newActiveItem.key;
          }
        },
        ArrowDown: () => {
          const newActiveItem = runtimeItems
            .slice(keyboardActiveIndex + 1)
            .filter((item) => item.type === 'item' && !item.disabled)[0];

          if (
            newActiveItem &&
            newActiveItem.type === 'item' &&
            newActiveItem.key
          ) {
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
            componentActions.destroyed = true;
          }
        },

        ArrowRight: () => {
          if (!keyboardActiveItem) {
            return;
          }
          setActiveItemKey(keyboardActiveItem.key);

          raf(() => {
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
            if (submenuApi) {
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

    // ---- mount/unmount lifecycle (React's refCallback) ----
    // fires onShow when the root node appears and onHide when it goes away —
    // including the `destroyed` case, where the component renders null
    // without unmounting
    let shown = false;
    const refCallback = (el: any) => {
      const node = (el as HTMLDivElement) ?? null;
      if (node && !shown) {
        shown = true;
        getState().domRef.current = node;
        mounted = true;
        getState().onShow?.(getState(), api);
        if (getState().autoFocus) {
          api.focus();
        }
      } else if (!node && shown) {
        shown = false;
        getState().onHide?.(getState());
        getState().domRef.current = null;
      } else if (node) {
        getState().domRef.current = node;
      }
    };

    onBeforeUnmount(() => {
      mounted = false;
      if (shown) {
        shown = false;
        getState().onHide?.(getState());
      }
      getState().domRef.current = null;
    });

    return () => {
      const s = getState();
      const {
        columns,
        runtimeItems,
        menuId,
        activeItemKey,
        keyboardActiveItemKey,
        destroyed,
        wrapLabels,
        parentMenuItemKey,
      } = s;

      if (destroyed) {
        return null;
      }

      const renderedChildren = runtimeItems.map((runtimeItem, index) =>
        h(RuntimeItemRenderer, {
          key: runtimeItem.type === 'item' ? runtimeItem.key : index,
          columns,
          item: runtimeItem,
          index,
          active:
            runtimeItem.type === 'item' && runtimeItem.key === activeItemKey,
          keyboardActive:
            runtimeItem.type === 'item' &&
            runtimeItem.key === keyboardActiveItemKey,
          onItemEnter: (item: MenuRuntimeItemSelectable, event: PointerEvent) =>
            onItemEnter(item.key, event),
          onItemLeave: (item: MenuRuntimeItemSelectable, event: PointerEvent) =>
            onItemLeave(item.key, event),
          onItemClick,
        }),
      );

      const gridTemplateColumns = columns
        .map((col) => {
          return (
            col.width ||
            (typeof col.flex === 'number' ? `${col.flex}fr` : col.flex) ||
            'auto'
          );
        })
        .join(' ');

      const style: Record<string, any> = {
        ...(attrs.style as Record<string, any> | undefined),
        gridTemplateColumns,
        gridTemplateRows: runtimeItems.map(() => `auto`).join(' '),
      };
      if (!wrapLabels) {
        style.whiteSpace = 'nowrap';
      }

      return h('div', { class: display.contents }, [
        h(
          'div',
          {
            ...attrs,
            'data-menu-id': menuId,
            'data-submenu-for': parentMenuItemKey,
            tabindex: 0,
            ref: refCallback,
            onKeydown: handleKeydown,
            onMousedown: () => {
              shouldSelectFirstItemOnFocus = false;
            },
            onMouseup: () => {
              shouldSelectFirstItemOnFocus = true;
            },
            onFocus: onMenuFocus,
            onBlur: onMenuBlur,
            class: join(
              MenuCls,
              attrs.class as string | undefined,
              'InfiniteMenu',
            ),
            style,
          },
          renderedChildren,
        ),
        h(SubmenuPortal),
      ]);
    };
  },
});

// this is here because we want a simple way for `showOverlay` (returned by
// the useOverlay composable) to inject the portal container into the menu
(Menu as any)[propToIdentifyMenu] = true;

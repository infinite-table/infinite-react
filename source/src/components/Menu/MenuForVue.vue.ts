/**
 * Vue sibling of the Menu component (Menu.tsx + index.tsx).
 *
 * The state machine (runtime items derivation, controlled/uncontrolled
 * props) is the shared managed-component system + menuStateShared.ts; the
 * keyboard navigation, item actions and focus handling are shared
 * (menuKeyboardNav.ts), and so are the submenu props, triangulation, grid
 * style and row cells (menuViewShared.ts); alignment comes through the Vue
 * useOverlay sibling. This file owns the Vue render tree: the CSS-grid
 * menu, item rows and submenu spawning — same DOM structure, classnames and
 * data attributes as React.
 *
 * Note: Vue menus are items-driven (`items` prop); declaring items as
 * children (React's <MenuItem/> JSX) is not supported.
 */
import { defineComponent, h, onBeforeUnmount, ref, watch } from 'vue';
import type { PropType, VNodeChild } from 'vue';

import { join } from '../../utils/join';

import { display } from '../InfiniteTable/utilities.css';
import { ExpandCollapseIcon } from '../InfiniteTable/components/icons/ExpandCollapseIcon/ExpandCollapseIconForVue.vue';

import { buildManagedVueComponent } from '../hooks/useComponentState/useManagedComponent.vue';
import { useOverlay } from '../hooks/useOverlay/useOverlayForVue.vue';

import { MenuCls, MenuRowCls, MenuSeparatorCls } from './MenuCls.css';
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
  createMenuFocus,
  handleMenuKeyDown,
  hideMenuAndParents,
  runMenuItemClick,
} from './menuKeyboardNav';
import {
  createMenuTriangleHandlers,
  getActiveSubmenuItem,
  getMenuGridStyle,
  getMenuItemCells,
  getSubmenuOverlayParams,
  getSubmenuProps,
} from './menuViewShared';
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

      let content: VNodeChild = null;

      if (item.type === 'decoration') {
        content = h('div', { style: item.style as any }, [
          item.value as VNodeChild,
        ]);
      } else {
        content = getMenuItemCells(item, columns, index, {
          active,
          keyboardActive,
          pressed: pressed.value,
        }).map((cell) => {
          const col = cell.column;

          const domProps: Record<string, any> = {
            style: cell.style,
            ...cell.dataAttributes,
            class: cell.className,
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
              item: item.value,
              column: col,
              value: cell.value,
              domProps,
            }) as VNodeChild;
          }

          return h('div', { key: cell.key, ...domProps }, [
            cell.value as VNodeChild,
          ]);
        }) as VNodeChild;
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

    const hideAll = () => hideMenuAndParents(getState);

    let shouldSelectFirstItemOnFocus = true;

    const { api, onMenuFocus } = createMenuFocus({
      getState,
      setFocused: (focused) => {
        componentActions.focused = focused;
      },
      setKeyboardActiveItemKey,
      shouldSelectFirstItemOnFocus: () => shouldSelectFirstItemOnFocus,
      hideAll,
    });

    const onMenuBlur = () => {
      componentActions.focused = false;
    };

    const onItemClick = (
      event: MouseEvent | KeyboardEvent,
      item: MenuRuntimeItemSelectable,
    ) => {
      runMenuItemClick(event, item, {
        getState,
        setActiveItemKey,
        setKeyboardActiveItemKey,
        hideAll,
      });
    };

    // ---- submenu triangulation (shared MenuTriangleContext) ----
    const { onItemEnter, onItemLeave } = createMenuTriangleHandlers(
      getState,
      (itemKey: string | null) => {
        if (!isMounted()) {
          return;
        }
        setActiveItemKey(itemKey);
      },
    );

    // ---- submenu spawning: mirrors the useLayoutEffect on activeItemKey ----
    const renderSubmenuForItem = (item: MenuRuntimeItemSelectable) => {
      const parentMenuId = getState().menuId;
      const overlayId = `${parentMenuId}-submenu`;

      const submenuProps = getSubmenuProps(item, {
        parentMenuId,
        constrainTo: getState().constrainTo,
        api,
        hideAll,
        setSubmenuApi,
        setActiveItemKey,
        setKeyboardActiveItemKey,
      });
      if (!submenuProps) {
        return null;
      }

      return h(Menu, { key: overlayId, ...submenuProps } as any);
    };

    watch(
      () => state.value.activeItemKey,
      (activeItemKey) => {
        const { runtimeItems, menuId, constrainTo } = getState();

        const activeItem = getActiveSubmenuItem(runtimeItems, activeItemKey);

        if (!activeItem) {
          setSubmenuApi(null);
          clearAll();
          return;
        }

        const overlayParams = getSubmenuOverlayParams(
          menuId,
          activeItem,
          constrainTo,
        );

        if (overlayParams) {
          showOverlay(() => renderSubmenuForItem(activeItem), overlayParams);
        }
      },
      { flush: 'post' },
    );

    // ---- keyboard navigation (shared menuKeyboardNav.ts) ----
    const handleKeydown = (keyboardEvent: KeyboardEvent) => {
      handleMenuKeyDown(keyboardEvent, {
        getState,
        setActiveItemKey,
        setKeyboardActiveItemKey,
        destroy: () => {
          componentActions.destroyed = true;
        },
        getSubmenuApi: () => submenuApi,
        isMounted,
        onItemClick,
      });
    };

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

      const style = getMenuGridStyle(
        s,
        attrs.style as Record<string, any> | undefined,
      );

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

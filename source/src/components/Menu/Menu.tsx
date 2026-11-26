import * as React from 'react';
import {
  HTMLProps,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { join } from '../../utils/join';

import { RenderHookComponent } from '../RenderHookComponent';
import { MenuCls, MenuRowCls } from './MenuCls.css';
import type {
  MenuColumn,
  MenuRenderable,
  MenuRuntimeItem,
  MenuRuntimeItemSelectable,
} from './MenuProps';
import { useOverlay } from '../hooks/useOverlay';

import { useMenuContext } from './MenuContext';
import { Menu } from '.';
import { MenuApi, MenuState } from './MenuState';
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
import { display } from '../InfiniteTable/utilities.css';
import { useMounted } from '../hooks/useMounted';
import { MenuItem } from './MenuItem';

function renderSubmenuForItem(
  item: MenuRuntimeItemSelectable,
  config: {
    api: MenuApi;
    parentMenuId: string;
    constrainTo: MenuState['constrainTo'];
    hideAll: VoidFunction;
    setSubmenuApi: (api: MenuApi) => void;
    setActiveItemKey: (itemKey: string | null) => void;
    setKeyboardActiveItemKey: (itemKey: string | null) => void;
  },
) {
  const overlayId = `${config.parentMenuId}-submenu`;

  const submenuProps = getSubmenuProps(item, config);
  if (!submenuProps) {
    return null;
  }

  return <Menu key={overlayId} {...submenuProps} />;
}
function useSubmenus({
  onItemActivate,
}: {
  onItemActivate: (item: MenuRuntimeItemSelectable | null) => void;
}) {
  const { getState } = useMenuContext();
  const [{ onItemEnter, onItemLeave }] = useState(() =>
    createMenuTriangleHandlers(getState, (itemKey: string | null) => {
      if (!itemKey) {
        onItemActivate(null);
        return;
      }

      const item = getState().runtimeItems.filter(
        (item) => item.type === 'item' && item.key === itemKey,
      )[0];

      onItemActivate(item as MenuRuntimeItemSelectable);
    }),
  );

  return {
    onItemEnter: useCallback(onItemEnter, []),
    onItemLeave: useCallback(onItemLeave, []),
  };
}

// function useRealignRef() {
//   const domRef = useRef<HTMLDivElement | null>(null);

//   const onRealign = useCallback((event: Event) => {
//     // console.log('realigned', event);
//   }, []);

//   const refCallback = useCallback((node: HTMLDivElement) => {
//     if (node) {
//       node.addEventListener('realign', onRealign);
//     } else {
//       if (domRef.current) {
//         domRef.current.removeEventListener('realign', onRealign);
//       }
//     }
//     domRef.current = node;
//   }, []);

//   return refCallback;
// }
export function MenuComponent(props: { domProps: HTMLProps<HTMLDivElement> }) {
  const { domProps } = props;

  const {
    componentState,
    componentState: {
      columns,
      runtimeItems,
      menuId,
      activeItemKey,
      keyboardActiveItemKey,
      constrainTo,
      destroyed,
      onShow,
      onHide,
      autoFocus,
      parentMenuItemKey,
      domRef,
    },
    componentActions,
    getState,
  } = useMenuContext();

  const setKeyboardActiveItemKey = useCallback((key: string | null) => {
    componentActions.keyboardActiveItemKey = key;
  }, []);
  const setActiveItemKey = useCallback((key: string | null) => {
    componentActions.activeItemKey = key;
  }, []);

  const isMounted = useMounted();

  const [submenuApi, setSubmenuApi] = useState<MenuApi | null>(null);

  const shouldSelectFirstItemOnFocus = useRef(true);

  const [{ api, onMenuFocus, hideAll }] = useState(() => {
    const hideAll = () => hideMenuAndParents(getState);

    return {
      hideAll,
      ...createMenuFocus({
        getState,
        setFocused: (focused) => {
          componentActions.focused = focused;
        },
        setKeyboardActiveItemKey,
        shouldSelectFirstItemOnFocus: () =>
          shouldSelectFirstItemOnFocus.current,
        hideAll,
      }),
    };
  });

  let renderedChildren: MenuRenderable = null;

  // it is VERY important this is useLayoutEffect and not useEffect - otherwise the menu triangulation logic would not work
  useLayoutEffect(() => {
    const { runtimeItems } = getState();

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

    const menu = () =>
      renderSubmenuForItem(activeItem, {
        constrainTo,
        setSubmenuApi,
        setActiveItemKey,
        setKeyboardActiveItemKey,
        parentMenuId: menuId,
        hideAll,
        api,
      });

    if (overlayParams) {
      showOverlay(menu, overlayParams);
    }
  }, [activeItemKey]);

  const onItemClick = (
    event: React.MouseEvent | KeyboardEvent,
    item: MenuRuntimeItemSelectable,
  ) => {
    runMenuItemClick(event, item, {
      getState,
      setActiveItemKey,
      setKeyboardActiveItemKey,
      hideAll,
    });
  };

  const {
    showOverlay,
    portal: portalWithSubmenus,
    clearAll,
  } = useOverlay({
    // all submenus will be displayed inside this menu
    // so when the parent menu is moved, the submenus are also moved
    portalContainer: false,
  });

  const { onItemEnter, onItemLeave } = useSubmenus({
    onItemActivate: (item) => {
      if (!isMounted()) {
        return;
      }
      const key = item ? item.key : null;
      setActiveItemKey(key);
    },
  });

  renderedChildren = runtimeItems.map((runtimeItem, index) => (
    <RuntimeItemRenderer
      key={runtimeItem.type === 'item' ? runtimeItem.key : index}
      onItemEnter={(item, event) => {
        onItemEnter(item.key, event);
      }}
      onItemLeave={(item, event) => {
        onItemLeave(item.key, event);
      }}
      columns={columns}
      active={runtimeItem.type === 'item' && runtimeItem.key === activeItemKey}
      keyboardActive={
        runtimeItem.type === 'item' && runtimeItem.key === keyboardActiveItemKey
      }
      item={runtimeItem}
      index={index}
      onClick={onItemClick}
    />
  ));

  const style: React.CSSProperties = getMenuGridStyle(
    componentState,
    domProps.style,
  );

  function handleKeydown(keyboardEvent: KeyboardEvent) {
    handleMenuKeyDown(keyboardEvent, {
      getState,
      setActiveItemKey,
      setKeyboardActiveItemKey,
      destroy: () => {
        componentActions.destroyed = true;
      },
      // the submenu api of this render: the raf of ArrowRight reads it
      getSubmenuApi: () => submenuApi,
      isMounted,
      onItemClick,
    });
  }
  function onMenuBlur() {
    componentActions.focused = false;
  }

  const refCallback = useCallback((node: HTMLDivElement) => {
    if (node) {
      domRef.current = node;
      onShow?.(getState(), api);
      if (autoFocus) {
        api.focus();
      }
    } else {
      onHide?.(getState());
      domRef.current = node;
    }
  }, []);
  const result = (
    <div className={display.contents}>
      <div
        {...domProps}
        data-menu-id={menuId}
        data-submenu-for={parentMenuItemKey}
        tabIndex={0}
        ref={refCallback}
        onKeyDown={(event) => {
          domProps.onKeyDown?.(event);
          handleKeydown(event as any as KeyboardEvent);
        }}
        onMouseDown={(event) => {
          shouldSelectFirstItemOnFocus.current = false;
          domProps.onMouseDown?.(event);
        }}
        onMouseUp={(event) => {
          shouldSelectFirstItemOnFocus.current = true;
          domProps.onMouseUp?.(event);
        }}
        onFocus={onMenuFocus}
        onBlur={onMenuBlur}
        className={join(MenuCls, domProps.className, 'InfiniteMenu')}
        style={style}
      >
        {renderedChildren}
      </div>
      {portalWithSubmenus}
    </div>
  );

  return destroyed ? null : result;
}

function RuntimeItemRenderer(props: {
  columns: MenuColumn[];
  item: MenuRuntimeItem;
  index: number;
  active: boolean;
  keyboardActive: boolean;
  onItemEnter?: (item: MenuRuntimeItemSelectable, event: PointerEvent) => void;
  onItemLeave?: (item: MenuRuntimeItemSelectable, event: PointerEvent) => void;
  onClick: (event: React.MouseEvent, item: MenuRuntimeItemSelectable) => void;
}) {
  const [pressed, setPressed] = React.useState(false);
  const { columns, item, index, active, keyboardActive } = props;

  let content = null;

  if (item.type === 'decoration') {
    content = <div style={item.style}>{item.value}</div>;
  } else {
    content = getMenuItemCells(item, columns, index, {
      active,
      keyboardActive,
      pressed,
    }).map((cell) => {
      const col = cell.column;

      const domProps: React.HTMLProps<HTMLDivElement> = {
        style: cell.style,
        ...cell.dataAttributes,
        className: cell.className,
        onPointerEnter: (event) => {
          if (!item.disabled) {
            props.onItemEnter?.(item, event as any as PointerEvent);
          }
        },
        onPointerLeave: (event) => {
          if (!item.disabled) {
            props.onItemLeave?.(item, event as any as PointerEvent);
          }
        },
        onMouseDown: () => {
          if (!item.disabled) {
            setPressed(true);
          }
        },
        onMouseUp: () => {
          if (!item.disabled) {
            setPressed(false);
          }
        },
        onClick: (event: React.MouseEvent) => {
          if (!item.disabled) {
            props.onClick(event, item);
          }
        },
      };

      return col.render ? (
        <RenderHookComponent
          key={cell.key}
          render={col.render}
          renderParam={{
            item: item.value,
            column: col,
            value: cell.value,
            domProps,
          }}
        />
      ) : (
        <div key={cell.key} {...domProps}>
          {cell.value}
        </div>
      );
    });
  }
  return <div className={MenuRowCls}>{content}</div>;
}

export { MenuComponent as Menu, MenuItem };
export type {
  MenuProps,
  MenuItemObject,
  MenuItemDefinition,
} from './MenuProps';

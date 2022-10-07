import * as React from 'react';
import {
  HTMLProps,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { join } from '../../utils/join';

import { Rectangle } from '../../utils/pageGeometry/Rectangle';

import { RenderHookComponent } from '../RenderHookComponent';
import { MenuCls, MenuItemCls, MenuRowCls } from './MenuCls.css';
import type {
  MenuColumn,
  MenuItemObject,
  MenuProps,
  MenuRenderable,
  MenuRuntimeItem,
  MenuRuntimeItemSelectable,
} from './MenuProps';
import { useOverlay } from '../hooks/useOverlay';
import { selectParent } from '../../utils/selectParent';

import { MenuTriangleContext } from './MenuTriangleContext';

import { useMenuContext } from './MenuContext';
import { Menu } from '.';
import { MenuApi, MenuState } from './MenuState';
import { raf } from '../../utils/raf';
import { display } from '../InfiniteTable/utilities.css';

function renderSubmenuForItem(
  item: MenuRuntimeItemSelectable,
  config: {
    api: MenuApi;
    parentMenuId: string;
    constrainTo: MenuState['constrainTo'];
    setSubmenuApi: (api: MenuApi) => void;
    setActiveItemKey: (itemKey: string | null) => void;
    setKeyboardActiveItemKey: (itemKey: string | null) => void;
  },
) {
  const {
    parentMenuId,
    setSubmenuApi,
    setActiveItemKey,
    setKeyboardActiveItemKey,
    constrainTo,
    api,
  } = config;
  const overlayId = `${parentMenuId}-submenu`;

  let itemMenu = item.menu;
  if (!itemMenu) {
    return null;
  }

  if (typeof itemMenu === 'function') {
    itemMenu = itemMenu();
  }

  return (
    <Menu
      key={overlayId}
      parentMenuItemKey={item.key}
      parentMenuId={parentMenuId}
      constrainTo={constrainTo}
      {...itemMenu}
      onShow={(state, api) => {
        (itemMenu as MenuProps)?.onShow?.(state, api);
        setSubmenuApi(api);
      }}
      onHide={(state) => {
        // the submenu was focused but now is unmounted
        setActiveItemKey(null);
        setKeyboardActiveItemKey(item.key);

        if (state.focused) {
          // so make sure we focus current menu
          api.focus();
        }
      }}
    />
  );
}
/**
 *
 * @param menuId The menu id
 * @param itemKey the item key
 * @returns Rectangle
 */
function getMenuItemRect(menuId: string, itemKey: string) {
  const cells = getMenuItemNodes(menuId, itemKey);
  if (!cells.length) {
    return null;
  }
  const first = Rectangle.from(cells[0]?.getBoundingClientRect());
  const last = Rectangle.from(cells[cells.length - 1].getBoundingClientRect());

  const rect = first;
  rect.width = last.left + last.width - first.left;

  return rect;
}

function getMenuItemNodes(menuId: string, itemKey: string): HTMLDivElement[] {
  const menuNode = selectParent(
    document.querySelector(
      `[data-menu-id="${menuId}"] [data-menu-item-key="${itemKey}"]`,
    ) as HTMLElement,
    `[data-menu-id="${menuId}"]`,
  );

  if (!menuNode) {
    return [];
  }

  const cells = menuNode.querySelectorAll(`[data-menu-item-key="${itemKey}"]`);

  return Array.from(cells) as HTMLDivElement[];
}

function getFirstCheckBoxInsideMenuItem(menuId: string, itemKey: string) {
  const cells = getMenuItemNodes(menuId, itemKey);
  if (!cells.length) {
    return null;
  }

  for (const cell of cells) {
    const input = cell.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement | null;
    if (input) {
      return input;
    }
  }
  return null;
}

function useSubmenus({
  onItemActivate,
}: {
  onItemActivate: (item: MenuRuntimeItemSelectable | null) => void;
}) {
  const { getState } = useMenuContext();
  const [{ onItemEnter, onItemLeave }] = useState(() => {
    return new MenuTriangleContext({
      parentMenuId: getState().parentMenuId,
      onItemActivate: (itemKey: string | null) => {
        if (!itemKey) {
          onItemActivate(null);
          return;
        }

        const item = getState().runtimeItems.filter(
          (item) => item.type === 'item' && item.key === itemKey,
        )[0];

        onItemActivate(item as MenuRuntimeItemSelectable);
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
        const rect = Rectangle.from(menuNode.getBoundingClientRect());

        return rect;
      },
    }).getHandlers();
  });

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
    componentState: {
      columns,
      runtimeItems,
      menuId,
      activeItemKey,
      keyboardActiveItemKey,
      constrainTo,
      destroyed,
      onAction,
      wrapLabels,
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

  let mountedRef = useRef<boolean>(true);

  const isMounted = () => mountedRef.current;

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [submenuApi, setSubmenuApi] = useState<MenuApi | null>(null);

  let renderedChildren: MenuRenderable = null;

  // it is VERY important this is useLayoutEffect and not useEffect - otherwise the menu triangulation logic would not work
  useLayoutEffect(() => {
    const { runtimeItems } = getState();

    const activeItem = runtimeItems.filter(
      (item) => item.type === 'item' && activeItemKey === item.key,
    )[0] as MenuRuntimeItemSelectable | null;

    if (!activeItem || !activeItem.menu) {
      setSubmenuApi(null);
      clearAll();
      return;
    }

    if (activeItem) {
      const alignTo = getMenuItemRect(menuId, activeItem.key)!;

      const menu = () =>
        renderSubmenuForItem(activeItem, {
          constrainTo,
          setSubmenuApi,
          setActiveItemKey,
          setKeyboardActiveItemKey,
          parentMenuId: menuId,
          api,
        });

      if (alignTo) {
        showOverlay(menu, {
          id: `${menuId}-submenu`,
          alignTo,
          alignPosition: [
            ['TopLeft', 'TopRight'],
            ['TopRight', 'TopLeft'],
          ],
          constrainTo,
        });
      }
      return;
    }
  }, [activeItemKey]);

  const onItemClick = (
    event: React.MouseEvent,
    item: MenuRuntimeItemSelectable,
  ) => {
    setKeyboardActiveItemKey(item.key);
    setActiveItemKey(item.key);

    if (item.originalMenuItem.onClick) {
      item.originalMenuItem.onClick(event);
    }
    if (item.originalMenuItem.onAction) {
      item.originalMenuItem.onAction(item.key, item.originalMenuItem);
    }
    if (onAction) {
      onAction(item.key, item.originalMenuItem);
    }
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

  const gridTemplateColumns = columns
    .map((col) => {
      return (
        col.width ||
        (typeof col.flex === 'number' ? `${col.flex}fr` : col.flex) ||
        'auto'
      );
    })
    .join(' ');

  const style: React.CSSProperties = {
    ...domProps.style,
    gridTemplateColumns,
    gridTemplateRows: runtimeItems.map(() => `auto`).join(' '),
  };
  if (!wrapLabels) {
    style.whiteSpace = 'nowrap';
  }

  function handleKeydown(keyboardEvent: KeyboardEvent) {
    const { runtimeItems, runtimeSelectableItems } = getState();
    let activeIndex = runtimeItems.findIndex(
      (runtimeItem) =>
        runtimeItem.type === 'item' &&
        runtimeItem.key === keyboardActiveItemKey,
    );

    let newActiveItemKey = keyboardActiveItemKey;

    const activeItem = runtimeItems[activeIndex] as MenuRuntimeItemSelectable;

    const validKeys = {
      ArrowUp: () => {
        const newActiveItem = runtimeItems
          .slice(0, activeIndex)
          .filter((item) => item.type === 'item' && !item.disabled)
          .pop();
        if (
          newActiveItem &&
          newActiveItem.type === 'item' &&
          newActiveItem.key
        ) {
          newActiveItemKey = newActiveItem.key;
        }
      },
      ArrowDown: () => {
        const newActiveItem = runtimeItems
          .slice(activeIndex + 1)
          .filter((item) => item.type === 'item' && !item.disabled)[0];
        if (
          newActiveItem &&
          newActiveItem.type === 'item' &&
          newActiveItem.key
        ) {
          newActiveItemKey = newActiveItem.key;
        }
      },
      Home: () => {
        validKeys.PageUp();
      },
      End: () => {
        validKeys.PageDown();
      },
      PageUp: () => {
        newActiveItemKey = runtimeSelectableItems[0].key;
      },
      PageDown: () => {
        newActiveItemKey =
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
        if (!activeItem) {
          return;
        }
        setActiveItemKey(activeItem.key);

        raf(() => {
          if (
            mountedRef.current &&
            submenuApi &&
            submenuApi.getParentMenuId() === getState().menuId
          ) {
            submenuApi.focus();
          }
        });
      },
      Enter: () => {
        if (!activeItem) {
          return;
        }
        if (activeItem.originalMenuItem?.menu) {
          // we close it if it was opened
          if (activeItem && activeItem.originalMenuItem.menu && submenuApi) {
            validKeys.ArrowLeft();
            return;
          }
          // or open if was closed
          if (activeItem) {
            setActiveItemKey(activeItem.key);
          }
        } else {
          onItemClick(keyboardEvent as any as React.MouseEvent, activeItem);
        }
      },
      ' ': () => {
        if (!activeItem) {
          return;
        }
        if (!activeItem.originalMenuItem.menu) {
          onItemClick(keyboardEvent as any as React.MouseEvent, activeItem);
        }

        const checkbox = getFirstCheckBoxInsideMenuItem(menuId, activeItem.key);
        if (!checkbox) {
          return;
        }

        checkbox.click();
      },
      Escape: () => {},
    };

    validKeys.Escape = validKeys.ArrowLeft;

    const fn = validKeys[keyboardEvent.key as keyof typeof validKeys];

    if (fn) {
      fn();
      keyboardEvent.preventDefault();
    }
    if (newActiveItemKey != activeItemKey) {
      setKeyboardActiveItemKey(newActiveItemKey);
    }
  }
  function onMenuBlur() {
    componentActions.focused = false;
  }

  const onMenuFocus = useCallback(function () {
    componentActions.focused = true;

    // we're using a special lazy focus (we consider shouldSelectFirstItemOnFocus), as the user might be actually clicking a menu item
    // directly and in this case, we would end up with a flicker
    // as we would select the first item and then the corresponding clicked
    // item would be selected - so we're using shouldSelectFirstItemOnFocus
    // which is adjusted on mousedown/up to prevent this flicker
    setTimeout(() => {
      // if it's still focused
      if (
        shouldSelectFirstItemOnFocus.current &&
        domRef.current &&
        domRef.current === document.activeElement &&
        getState().keyboardActiveItemKey == null
      ) {
        setKeyboardActiveItemKey(
          getState().runtimeSelectableItems[0]?.key ?? null,
        );
      }
    });
  }, []);

  const shouldSelectFirstItemOnFocus = useRef(true);

  const [api] = useState(() => {
    const result: MenuApi = {
      focus: () => {
        if (domRef.current) {
          domRef.current.focus();
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

    return result;
  });

  const refCallback = useCallback((node) => {
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
  const key = item.type === 'item' ? item.value.key : index;

  let content = null;

  if (item.type === 'decoration') {
    content = <div style={item.style}>{item.value}</div>;
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

        const domProps: React.HTMLProps<HTMLDivElement> = {
          style,
          //@ts-ignore
          'data-menu-column-id': `${item.parentMenuId}-col-${col.name}`,
          'data-menu-row-id': `${item.parentMenuId}-row-${index}`,
          'data-menu-item-key': `${item.key}`,
          className: join(
            MenuItemCls({
              active,
              disabled: !!item.disabled,
              keyboardActive,
              pressed: pressed || props.active,
            }),
            item.className,
          ),
          onPointerEnter: (event) => {
            if (!item.disabled) {
              // setHover(true);
              props.onItemEnter?.(item, event as any as PointerEvent);
            }
          },
          onPointerLeave: (event) => {
            if (!item.disabled) {
              // setHover(false);
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
            key={`${key}-${field}`}
            render={col.render}
            renderParam={{
              item: target,
              column: col,
              value: target[field],
              domProps,
            }}
          />
        ) : (
          <div key={`${key}-${field}`} {...domProps}>
            {target[field]}
          </div>
        );
      })
      .filter(Boolean);
  }
  return <div className={MenuRowCls}>{content}</div>;
}

function MenuItem(_props: {
  key: MenuItemObject['key'];
  span?: MenuItemObject['span'];
  label?: MenuItemObject['label'];
  children?: MenuItemObject['description'];
  description?: MenuItemObject['description'];
  __is_menu_item: boolean;
}) {
  // this component is just for declaratively rendering menu items when used in static situations like:

  /**
   * 
      <Menu>
        <MenuItem key="copy">Copy</MenuItem>
        <MenuItem key="paste">Paste</MenuItem>
      </Menu>
   */

  // should not be used in dynamic situations like:

  /**
   * 
   <Menu items={[...]} />
   */

  return null;
}

MenuItem.defaultProps = {
  __is_menu_item: true,
};

export { MenuComponent as Menu, MenuItem };
export type {
  MenuProps,
  MenuItemObject,
  MenuItemDefinition,
} from './MenuProps';

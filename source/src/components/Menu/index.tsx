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
import { getChangeDetect } from '../DataSource/privateHooks/getChangeDetect';
import { ExpanderIcon } from '../InfiniteTable/components/icons/ExpanderIcon';
import { RenderHookComponent } from '../RenderHookComponent';
import { clamp } from '../utils/clamp';
import { Rectangle } from '../../utils/pageGeometry/Rectangle';
import {
  MenuCls,
  MenuItemCls,
  MenuRowCls,
  MenuSeparatorCls,
} from './MenuCls.css';
import type {
  MenuColumn,
  MenuDecoration,
  MenuItemObject,
  MenuItemDefinition,
  MenuProps,
  MenuRenderable,
  MenuRuntimeItem,
  MenuRuntimeItemSelectable,
} from './MenuProps';
import { useOverlay } from '../hooks/useOverlay';
import { selectParent } from '../../utils/selectParent';
import { propToIdentifyMenu } from './propToIdentifyMenu';
import { MenuTriangleContext } from './MenuTriangleContext';
import { useLatest } from '../hooks/useLatest';

const SEPARATOR: MenuItemDefinition = '-';
const SUBMENU_COL_NAME = 'submenu';

function MenuSeparator() {
  return <hr className={MenuSeparatorCls} />;
}

/**
 *
 * @param menuId The menu id
 * @param itemKey the item key
 * @returns Rectangle
 */
function getMenuItemRect(menuId: string, itemKey: string) {
  const menuNode = selectParent(
    document.querySelector(
      `[data-menu-id="${menuId}"] [data-menu-item-key="${itemKey}"]`,
    ) as HTMLElement,
    `[data-menu-id="${menuId}"]`,
  );

  if (!menuNode) {
    return null;
  }

  const cells = menuNode.querySelectorAll(`[data-menu-item-key="${itemKey}"]`);
  const first = Rectangle.from(cells[0]?.getBoundingClientRect());
  const last = Rectangle.from(cells[cells.length - 1].getBoundingClientRect());

  const rect = first;
  rect.width = last.left + last.width - first.left;

  return rect;
}

type RuntimeItemContext = {
  columns: MenuColumn[];
  keyboardActiveItemKey: string | null;
  activeItemKey: string | null;
  menuId: string;
};
const toRuntimeItem = (
  { columns, keyboardActiveItemKey, activeItemKey, menuId }: RuntimeItemContext,
  item: MenuItemDefinition,
) => {
  const menuItem =
    item &&
    ((item as MenuItemObject).key != null ||
      (item as MenuItemObject).label != null)
      ? (item as MenuItemObject)
      : null;

  const menuDecoration =
    menuItem === null ? (
      item === SEPARATOR ? (
        <MenuSeparator />
      ) : (
        (item as MenuDecoration)
      )
    ) : null;

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

function childrenToRuntimeItems(
  context: RuntimeItemContext,
  children: React.ReactNode,
) {
  // items are passed as children
  // so we iterate over all children
  return (
    React.Children.map(children, (child) => {
      // to find <MenuItem /> components
      //@ts-ignore
      if (child?.props.__is_menu_item) {
        //@ts-ignore
        const itemProps = { ...child.props };
        if (!itemProps.key) {
          //@ts-ignore
          itemProps.key = child.key as string;
        }
        if (!itemProps.description) {
          //@ts-ignore
          itemProps.description = child.props.children;
        }

        if (!itemProps.label) {
          itemProps.label = itemProps.children;
        }
        return toRuntimeItem(context, itemProps);
      }
      // and other decorative elements
      return toRuntimeItem(context, child as MenuItemDefinition);
    }) || []
  );
}

const defaultColumns: MenuColumn[] = [
  {
    name: 'label',
  },
];

function useSubmenus(
  runtimeItems: MenuRuntimeItem[],
  {
    onItemActivate,
  }: {
    onItemActivate: (item: MenuRuntimeItemSelectable | null) => void;
  },
) {
  const getRuntimeItems = useLatest(runtimeItems);

  const [{ onItemEnter, onItemLeave }] = useState(() => {
    return new MenuTriangleContext({
      onItemActivate: (itemKey: string | null) => {
        if (!itemKey) {
          onItemActivate(null);
          return;
        }

        const item = getRuntimeItems().filter(
          (item) => item.type === 'item' && item.key === itemKey,
        )[0];

        onItemActivate(item as MenuRuntimeItemSelectable);
      },
      itemHasSubMenu: (itemKey: string) => {
        const item = getRuntimeItems().filter(
          (item) => item.type === 'item' && item.key === itemKey && item.menu,
        )[0];

        return !!item;
      },
      getMenuRectFor: (itemKey) => {
        const selector = `[data-submenu-for="${itemKey}"]`;
        const menuNode = document.querySelector(selector);
        if (!menuNode) {
          return null;
        }
        return Rectangle.from(menuNode.getBoundingClientRect());
      },
    }).getHandlers();
  });

  return { onItemEnter, onItemLeave };
}

function useRealignRef() {
  const domRef = useRef<HTMLDivElement | null>(null);

  const onRealign = useCallback((event: Event) => {
    // console.log('realigned', event);
  }, []);

  const refCallback = useCallback((node: HTMLDivElement) => {
    if (node) {
      node.addEventListener('realign', onRealign);
    } else {
      if (domRef.current) {
        domRef.current.removeEventListener('realign', onRealign);
      }
    }
    domRef.current = node;
  }, []);

  return refCallback;
}
function MenuComponent(props: MenuProps & HTMLProps<HTMLDivElement>) {
  const {
    children,
    portalContainer: _portalContainerFromProps,
    items,
    columns: cols,
    addSubmenuColumnIfNeeded,
    bubbleActionsFromSubmenus,
    wrapLabels,
    onAction,
    constrainTo,
    parentMenuId,
    parentMenuItemKey,
    id,
    //@ts-ignore
    __is_infinite_menu_component,
    ...domProps
  } = props;

  let [menuId] = useState<string>(() => id || getChangeDetect());

  if (parentMenuId) {
    menuId = `${parentMenuId}-${menuId}`;
  }

  const [keyboardActiveItemKey, setKeyboardActiveItemKey] = useState<
    string | null
  >(null);
  const [activeItemKey, setActiveItemKey] = useState<string | null>(null);

  const columns = cols || [...defaultColumns];

  let mountedRef = useRef<boolean>(true);

  const isMounted = () => mountedRef.current;

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  let runtimeItems: MenuRuntimeItem[] = [];

  let renderedChildren: MenuRenderable = null;

  const context = {
    columns,
    keyboardActiveItemKey,
    activeItemKey,
    menuId: menuId,
  };
  if (items) {
    runtimeItems = items.map(toRuntimeItem.bind(null, context));
  } else if (!items && typeof children !== 'function') {
    runtimeItems = childrenToRuntimeItems(context, children);
  }

  if (addSubmenuColumnIfNeeded) {
    const hasSubmenus =
      runtimeItems.filter((item) => item.type === 'item' && item.menu != null)
        .length > 0;

    if (hasSubmenus && !columns.find((col) => col.name == SUBMENU_COL_NAME)) {
      columns.push({
        name: SUBMENU_COL_NAME,
        render: ({ domProps, item }) => {
          return item.menu ? (
            <div {...domProps}>
              <ExpanderIcon expanded={false} />
            </div>
          ) : (
            <div {...domProps} />
          );
        },
      });
    }
  }

  const getRuntimeItems = useLatest(runtimeItems);

  // it is VERY important this is useLayoutEffect and not useEffect - otherwise the menu triangulation logic would not work
  useLayoutEffect(() => {
    const runtimeItems = getRuntimeItems();

    const item = runtimeItems.filter(
      (item) => item.type === 'item' && activeItemKey === item.key,
    )[0] as MenuRuntimeItemSelectable | null;

    if (!item || !item.menu) {
      clearAll();
      return;
    }

    if (item) {
      const overlayId = `${menuId}-submenu`;
      const alignTo = getMenuItemRect(menuId, item.key)!;

      if (alignTo) {
        showOverlay(
          <MenuComponent
            key={overlayId}
            parentMenuItemKey={item.key}
            parentMenuId={menuId}
            constrainTo={constrainTo}
            {...item.menu}
          />,
          {
            alignTo,
            alignPosition: [
              ['TopLeft', 'TopRight'],
              ['TopRight', 'TopLeft'],
            ],
            constrainTo,
          },
        );
      }
      return;
    }

    // clearAll();
    // setExpandedItemKey(null);
  }, [activeItemKey]);

  const onItemClick = (
    event: React.MouseEvent,
    item: MenuRuntimeItemSelectable,
  ) => {
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
    hideOverlay,
  } = useOverlay({
    // all submenus will be displayed inside this menu
    // so when the parent menu is moved, the submenus are also moved
    portalContainer: false,
  });

  const { onItemEnter, onItemLeave } = useSubmenus(runtimeItems, {
    //@ts-ignore
    parentMenuId,
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
      onClick={(event, item) => {
        setKeyboardActiveItemKey(item.key);
        setActiveItemKey(item.key);
        onItemClick(event, item);
      }}
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

  function handleKeydown(event: { key: string; preventDefault: VoidFunction }) {
    const selectableRuntimeItems = runtimeItems.filter(
      (item) => item.type === 'item' && !item.disabled,
    ) as MenuRuntimeItemSelectable[];

    let activeIndex = selectableRuntimeItems.findIndex(
      (runtimeItem) => runtimeItem.key === keyboardActiveItemKey,
    );
    let newActiveIndex = activeIndex;

    const validKeys = {
      ArrowUp: () => {
        newActiveIndex--;
      },
      ArrowDown: () => {
        newActiveIndex++;
      },
      PageUp: () => {
        newActiveIndex = 0;
      },
      PageDown: () => {
        newActiveIndex = selectableRuntimeItems.length - 1;
      },
      ArrowLeft: () => {
        setActiveItemKey(null);
      },
      ArrowRight: () => {
        const activeItem = selectableRuntimeItems[activeIndex];
        if (activeItem) {
          setActiveItemKey(activeItem.key);
        }
      },
      Enter: () => {
        const activeItem = selectableRuntimeItems[activeIndex];
        if (activeItem) {
          setActiveItemKey(activeItem.key);
        }
      },
    };

    const fn = validKeys[event.key as keyof typeof validKeys];
    if (fn) {
      fn();
      event.preventDefault();
    }
    newActiveIndex = clamp(
      newActiveIndex,
      0,
      selectableRuntimeItems.length - 1,
    );
    if (newActiveIndex != activeIndex) {
      setKeyboardActiveItemKey(selectableRuntimeItems[newActiveIndex].key);
    }
  }

  function onMenuMouseEnter() {}
  function onMenuMouseLeave() {}

  function onMenuFocus() {
    // we're doing a lazy focus, as the user might be actually clicking a menu item
    // directly and in this case, the item would
    requestAnimationFrame(() => {
      // if it's still focused
      if (
        domRef.current &&
        domRef.current === document.activeElement &&
        keyboardActiveItemKey == null
      ) {
        setKeyboardActiveItemKey(
          (
            runtimeItems.filter(
              (item) => item.type === 'item',
            ) as MenuRuntimeItemSelectable[]
          )[0]?.key ?? null,
        );
      }
    });
  }

  const domRef = useRef<HTMLDivElement | null>(null);

  let result = (
    <div
      data-menu-id={menuId}
      data-submenu-for={parentMenuItemKey}
      {...domProps}
      ref={domRef}
      onKeyDown={(event) => {
        if (domProps.onKeyDown) {
          domProps.onKeyDown(event);
        }
        handleKeydown(event);
      }}
      onMouseEnter={onMenuMouseEnter}
      onMouseLeave={onMenuMouseLeave}
      tabIndex={0}
      onFocus={onMenuFocus}
      className={join(MenuCls, domProps.className)}
      style={style}
    >
      {renderedChildren}
      {portalWithSubmenus}
    </div>
  );

  return result;
}

const menuDefaultProps: MenuProps & { [propToIdentifyMenu]?: boolean } = {
  addSubmenuColumnIfNeeded: true,
  bubbleActionsFromSubmenus: true,
  wrapLabels: false,
  /**
   * this is here because we want a simple way for `showOverlay` (which is returned by useOverlay hook)
   * to inject the portal container into the menu
   */
  [propToIdentifyMenu]: true,
};
MenuComponent.defaultProps = menuDefaultProps;

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
  /**
   * Improvement: we should have a better hover state:
   *
   * Namely, changing the hover background color should only happen if a menu item is
   * hovered over and ready to be expanded (either expanded, or, if it has no children, no other item should be expanded)
   */
  // const [hover, setHover] = React.useState(false);
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
              keyboardActive: item.keyboardActive,
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

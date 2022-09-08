import * as React from 'react';
import { HTMLProps, useRef, useState } from 'react';
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

const SEPARATOR: MenuItemDefinition = '-';
const SUBMENU_COL_NAME = 'submenu';

function MenuSeparator() {
  return <hr className={MenuSeparatorCls} />;
}

type RuntimeItemContext = {
  columns: MenuColumn[];
  activeItemKey: string | null;
  menuId: string;
};
const toRuntimeItem = (
  { columns, activeItemKey, menuId }: RuntimeItemContext,
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

function Menu(props: MenuProps & HTMLProps<HTMLDivElement>) {
  const [menuId] = useState<string>(() => getChangeDetect());
  const {
    children,
    items,
    columns: cols,
    addSubmenuColumnIfNeeded,
    bubbleActionsFromSubmenus,
    wrapLabels,
    onAction,
    ...domProps
  } = props;

  const [activeItemKey, setActiveItemKey] = useState<string | null>(null);
  const [expandedItemKey, setExpandedItemKey] = useState<string | null>(null);

  const columns = cols || defaultColumns;

  let runtimeItems: MenuRuntimeItem[] = [];

  let renderedChildren: MenuRenderable = null;

  const context = { columns, activeItemKey, menuId: menuId };
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
              <ExpanderIcon />
            </div>
          ) : (
            <div {...domProps} />
          );
        },
      });
    }
  }

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

  const { showOverlay, portal } = useOverlay({
    portalContainer: '#portal',
  });

  const hoveredItemRef = useRef<{
    time: number;
    item: MenuRuntimeItemSelectable;
  } | null>(null);

  let showSubmenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  function setHovered(
    hover: boolean,
    item: MenuRuntimeItemSelectable | null,
    node: HTMLDivElement | null,
  ) {
    if (item && hover) {
      hoveredItemRef.current = {
        item,
        time: Date.now(),
      };
      showSubmenuTimeoutRef.current = setTimeout(() => {
        setExpandedItemKey(item.key);

        if (!node || !node.parentElement) {
          return;
        }
        const firstColNode = node.parentElement.firstChild! as HTMLElement;
        const rect = Rectangle.from(firstColNode.getBoundingClientRect());

        const menuNode = selectParent(
          firstColNode,
          `[data-menu-id="${menuId}"]`,
        );
        if (!menuNode) {
          return;
        }

        const menuRect = Rectangle.from(menuNode.getBoundingClientRect());

        // make the rectable stretch to cover all the menu horizontally
        rect.left = menuRect.left;
        rect.width = menuRect.width;

        showOverlay(<Menu {...item.menu} />, {
          alignTo: rect,
          alignPosition: [
            ['TopLeft', 'TopRight'],
            ['TopRight', 'TopLeft'],
          ],
          constrainTo: true,
          id: `${menuId}-submenu-${item.key}`,
        });
      }, 500);
    } else {
      hoveredItemRef.current = null;
      clearTimeout(showSubmenuTimeoutRef.current!);
      if (expandedItemKey) {
        setExpandedItemKey(null);
      }
    }
  }

  React.useEffect(() => {
    return () => {
      clearTimeout(showSubmenuTimeoutRef.current!);
    };
  }, []);

  const onItemEnter = (
    item: MenuRuntimeItemSelectable,
    event: React.MouseEvent,
  ) => {
    setHovered(true, item, event.target as HTMLDivElement);
  };
  const onItemLeave = (item: MenuRuntimeItemSelectable) => {
    setHovered(false, item, null);
  };

  renderedChildren = runtimeItems.map((runtimeItem, index) => (
    <RuntimeItemRenderer
      key={runtimeItem.type === 'item' ? runtimeItem.key : index}
      onItemEnter={onItemEnter}
      onItemLeave={onItemLeave}
      columns={columns}
      expanded={
        runtimeItem.type === 'item' && runtimeItem.key === expandedItemKey
      }
      item={runtimeItem}
      index={index}
      onClick={(event, item) => {
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

  function handleKeydown(event: { key: string }) {
    const selectableRuntimeItems = runtimeItems.filter(
      (item) => item.type === 'item' && !item.disabled,
    ) as MenuRuntimeItemSelectable[];

    let activeIndex = selectableRuntimeItems.findIndex(
      (runtimeItem) => runtimeItem.key === activeItemKey,
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
    };

    const fn = validKeys[event.key as keyof typeof validKeys];
    if (fn) {
      fn();
    }
    newActiveIndex = clamp(
      newActiveIndex,
      0,
      selectableRuntimeItems.length - 1,
    );
    if (newActiveIndex != activeIndex) {
      setActiveItemKey(selectableRuntimeItems[newActiveIndex].key);
    }
  }

  function onMenuMouseEnter() {}
  function onMenuMouseLeave() {}

  return (
    <div
      data-menu-id={menuId}
      {...domProps}
      onKeyDown={(event) => {
        if (domProps.onKeyDown) {
          domProps.onKeyDown(event);
        }
        handleKeydown(event);
      }}
      onMouseEnter={onMenuMouseEnter}
      onMouseLeave={onMenuMouseLeave}
      tabIndex={0}
      className={join(MenuCls, domProps.className)}
      style={style}
    >
      {portal}
      {renderedChildren}
    </div>
  );
}

const menuDefaultProps: MenuProps = {
  addSubmenuColumnIfNeeded: true,
  bubbleActionsFromSubmenus: true,
  wrapLabels: false,
};
Menu.defaultProps = menuDefaultProps;

function RuntimeItemRenderer(props: {
  columns: MenuColumn[];
  item: MenuRuntimeItem;
  index: number;
  expanded: boolean;
  onItemEnter?: (
    item: MenuRuntimeItemSelectable,
    event: React.MouseEvent,
  ) => void;
  onItemLeave?: (
    item: MenuRuntimeItemSelectable,
    event: React.MouseEvent,
  ) => void;
  onClick: (event: React.MouseEvent, item: MenuRuntimeItemSelectable) => void;
}) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const { columns, item, index } = props;
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
          className: join(
            MenuItemCls({
              hover: hover,
              disabled: !!item.disabled,
              active: item.active,
              pressed: pressed || props.expanded,
            }),
            item.className,
          ),
          onMouseEnter: (event) => {
            if (!item.disabled) {
              setHover(true);
              props.onItemEnter?.(item, event);
            }
          },
          onMouseLeave: (event) => {
            if (!item.disabled) {
              setHover(false);
              props.onItemLeave?.(item, event);
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

export { Menu, MenuItem };
export type {
  MenuProps,
  MenuItemObject,
  MenuItemDefinition,
} from './MenuProps';

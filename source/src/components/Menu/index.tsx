import * as React from 'react';
import { HTMLProps, useState } from 'react';
import { join } from '../../utils/join';
import { ExpanderIcon } from '../InfiniteTable/components/icons/ExpanderIcon';
import { RenderHookComponent } from '../RenderHookComponent';
import { clamp } from '../utils/clamp';
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

const SEPARATOR: MenuItemDefinition = '-';

function MenuSeparator() {
  return <hr className={MenuSeparatorCls} />;
}

type RuntimeItemContext = {
  columns: MenuColumn[];
  activeItemKey: string | null;
};
const toRuntimeItem = (
  { columns, activeItemKey }: RuntimeItemContext,
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
          disabled: !!menuItem.disabled,
          active: menuItem.key === activeItemKey,
          value: menuItem,
          span: menuItem.span || 1,
          key: menuItem.key,
          menu: menuItem.menu || null,
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
  const {
    children,
    items,
    columns: cols,
    addSubmenuColumnIfNeeded,
    ...domProps
  } = props;

  const [activeItemKey, setActiveItemKey] = useState<string | null>(null);

  const columns = cols || defaultColumns;

  let runtimeItems: MenuRuntimeItem[] = [];

  let renderedChildren: MenuRenderable = null;

  const context = { columns, activeItemKey };
  if (items) {
    runtimeItems = items.map(toRuntimeItem.bind(null, context));
  } else if (!items && typeof children !== 'function') {
    runtimeItems = childrenToRuntimeItems(context, children);
  }

  if (addSubmenuColumnIfNeeded) {
    const hasSubmenus =
      runtimeItems.filter((item) => item.type === 'item' && item.menu != null)
        .length > 0;

    if (hasSubmenus && !columns.find((col) => col.name == 'submenu')) {
      columns.push({
        name: 'submenu',
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

  // if (typeof children === 'function' && items) {
  //   renderedChildren = runtimeItems.map((item) => {
  //     return (children as Function)!({
  //       item,
  //       columns,
  //     });
  //   });
  // } else {
  renderedChildren = runtimeItems.map((runtimeItem, index) => (
    <RuntimeItemRenderer
      columns={columns}
      item={runtimeItem}
      index={index}
      onClick={(item) => setActiveItemKey(item.key)}
    />
  ));
  // }

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

  return (
    <div
      {...domProps}
      onKeyDown={(event) => {
        if (domProps.onKeyDown) {
          domProps.onKeyDown(event);
        }
        handleKeydown(event);
      }}
      tabIndex={0}
      className={join(MenuCls, domProps.className)}
      style={style}
    >
      {renderedChildren}
    </div>
  );
}

const menuDefaultProps: MenuProps = {
  addSubmenuColumnIfNeeded: true,
};
Menu.defaultProps = menuDefaultProps;

function RuntimeItemRenderer(props: {
  columns: MenuColumn[];
  item: MenuRuntimeItem;
  index: number;
  onClick: (item: MenuRuntimeItemSelectable) => void;
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
          className: MenuItemCls({
            hover,
            disabled: !!item.disabled,
            active: item.active,
            pressed,
          }),
          onMouseEnter: () => {
            if (!item.disabled) {
              setHover(true);
            }
          },
          onMouseLeave: () => {
            if (!item.disabled) {
              setHover(false);
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
          onClick: () => {
            if (!item.disabled) {
              props.onClick(item);
            }
          },
        };

        return col.render ? (
          <RenderHookComponent
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

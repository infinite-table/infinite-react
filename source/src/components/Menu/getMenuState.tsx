import * as React from 'react';
import { getChangeDetect } from '../DataSource/privateHooks/getChangeDetect';
import { ForwardPropsToStateFnResult } from '../hooks/useComponentState';
import { ExpanderIcon } from '../InfiniteTable/components/icons/ExpanderIcon';
import {
  childrenToRuntimeItems,
  toRuntimeItem,
} from './childrenToRuntimeItems';
import {
  MenuColumn,
  MenuProps,
  MenuRuntimeItem,
  MenuRuntimeItemSelectable,
} from './MenuProps';
import {
  MenuDerivedState,
  MenuMappedState,
  MenuSetupState,
  MenuState,
} from './MenuState';

const SUBMENU_COL_NAME = 'submenu';

export function getInitialMenuState(): MenuSetupState {
  const domRef = React.createRef<HTMLDivElement | null>();
  return {
    keyboardActiveItemKey: null,
    activeItemKey: null,
    generatedId: getChangeDetect(),
    focused: false,
    destroyed: false,
    domRef,
  };
}

export const forwardProps = (): ForwardPropsToStateFnResult<
  MenuProps,
  MenuMappedState,
  MenuSetupState
> => {
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
  };
};

const defaultColumns: MenuColumn[] = [
  {
    name: 'label',
  },
];

export const deriveStateFromProps = (params: {
  props: MenuProps;
  state: MenuState;
}): MenuDerivedState => {
  const { props, state } = params;
  const { activeItemKey, keyboardActiveItemKey } = state;
  const { items, children, addSubmenuColumnIfNeeded, parentMenuId } = props;

  let menuId = props.id || state.generatedId;

  if (parentMenuId) {
    menuId = `${parentMenuId}-${menuId}`;
  }

  const columns: MenuColumn[] = [...(props.columns || defaultColumns)];
  const context = {
    columns,
    keyboardActiveItemKey,
    activeItemKey,
    menuId,
  };

  let runtimeItems: MenuRuntimeItem[] = [];
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

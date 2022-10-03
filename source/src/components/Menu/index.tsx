import * as React from 'react';
import { HTMLProps } from 'react';

import {
  getComponentStateRoot,
  useComponentState,
} from '../hooks/useComponentState';
import { useLatest } from '../hooks/useLatest';
import {
  forwardProps,
  getInitialMenuState,
  deriveStateFromProps,
} from './getMenuState';
import { MenuComponent } from './Menu';
import { MenuContext } from './MenuContext';
import { MenuProps } from './MenuProps';
import { MenuState } from './MenuState';
import { propToIdentifyMenu } from './propToIdentifyMenu';

const MenuRoot = getComponentStateRoot({
  initSetupState: getInitialMenuState,
  forwardProps,
  // @ts-ignore
  mapPropsToState: deriveStateFromProps,
  layoutEffect: true,
});

function MenuContextProvider(props: { domProps: HTMLProps<HTMLDivElement> }) {
  const { componentActions, componentState } = useComponentState<MenuState>();

  const getState = useLatest(componentState);

  return (
    <MenuContext.Provider
      value={{ componentActions, componentState, getState }}
    >
      <MenuComponent domProps={props.domProps} />
    </MenuContext.Provider>
  );
}

export function Menu(props: MenuProps & HTMLProps<HTMLDivElement>) {
  const {
    children,
    portalContainer,
    items,
    parentMenuId,

    addSubmenuColumnIfNeeded,
    bubbleActionsFromSubmenus,
    onShow,
    onHide,
    wrapLabels,
    onAction,
    constrainTo,
    columns,
    parentMenuItemKey,
    id,
    //@ts-ignore
    __is_infinite_menu_component,
    ...domProps
  } = props;

  const menu = (
    <MenuRoot {...props}>
      <MenuContextProvider domProps={domProps} />
    </MenuRoot>
  );

  if (__DEV__) {
    return <React.StrictMode>{menu}</React.StrictMode>;
  }
  return menu;
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
Menu.defaultProps = menuDefaultProps;

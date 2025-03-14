import * as React from 'react';
import { HTMLProps } from 'react';

import {
  buildManagedComponent,
  useManagedComponentState,
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

const { ManagedComponentContextProvider: MenuRoot } = buildManagedComponent({
  initSetupState: getInitialMenuState,
  forwardProps,
  // @ts-ignore
  mapPropsToState: deriveStateFromProps,
  layoutEffect: true,
});

function MenuContextProvider(props: { domProps: HTMLProps<HTMLDivElement> }) {
  const { componentActions, componentState } =
    useManagedComponentState<MenuState>();

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

    addSubmenuColumnIfNeeded = true,
    bubbleActionsFromSubmenus = true,

    onShow,
    onHide,
    wrapLabels = false,
    onAction,
    constrainTo,
    columns,
    parentMenuItemKey,
    autoFocus,
    id,
    onHideIntent,
    //@ts-ignore
    __is_infinite_menu_component,
    ...domProps
  } = props;

  const menu = (
    <MenuRoot
      addSubmenuColumnIfNeeded={addSubmenuColumnIfNeeded}
      bubbleActionsFromSubmenus={bubbleActionsFromSubmenus}
      wrapLabels={wrapLabels}
      {...props}
    >
      <MenuContextProvider domProps={domProps} />
    </MenuRoot>
  );

  if (__DEV__) {
    return <React.StrictMode>{menu}</React.StrictMode>;
  }
  return menu;
}
// DON'T REMOVE THIS LINE
/**
 * this is here because we want a simple way for `showOverlay` (which is returned by useOverlay hook)
 * to inject the portal container into the menu
 */
Menu[propToIdentifyMenu] = true;

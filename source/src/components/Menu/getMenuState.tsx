import * as React from 'react';
import { ForwardPropsToStateFnResult } from '../hooks/useComponentState';
import { childrenToRuntimeItems } from './childrenToRuntimeItems';
import { MenuProps } from './MenuProps';
import {
  MenuDerivedState,
  MenuMappedState,
  MenuSetupState,
  MenuState,
} from './MenuState';
import {
  deriveMenuStateShared,
  forwardMenuProps,
  getInitialMenuStateShared,
} from './menuStateShared';
import { reactMenuRenderAdapters } from './reactMenuAdapters';

export function getInitialMenuState(): MenuSetupState {
  const state = getInitialMenuStateShared();
  return {
    ...state,
    domRef: React.createRef<HTMLDivElement | null>() as any,
  };
}

export const forwardProps = (): ForwardPropsToStateFnResult<
  MenuProps,
  MenuMappedState,
  MenuSetupState
> => {
  return forwardMenuProps() as any;
};

export const deriveStateFromProps = (params: {
  props: MenuProps;
  state: MenuState;
}): MenuDerivedState => {
  return deriveMenuStateShared(params, {
    ...reactMenuRenderAdapters,
    childrenToRuntimeItems,
  });
};

import {
  MenuActions,
  // MenuApi,
  // MenuComputedValues,
  MenuState,
} from './MenuState';

export interface MenuContextValue {
  // imperativeApi: MenuApi;
  componentState: MenuState;
  componentActions: MenuActions;
  // computed: MenuComputedValues;
  // getComputed: () => MenuComputedValues;
  getState: () => MenuState;
}

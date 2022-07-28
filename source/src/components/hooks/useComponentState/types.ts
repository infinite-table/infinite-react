export type ComponentStateContext<T_STATE, T_ACTIONS> = {
  getComponentState: () => T_STATE;
  componentState: T_STATE;
  componentActions: T_ACTIONS;
};

export type ComponentStateGeneratedActions<T_STATE> = {
  [k in keyof T_STATE]: T_STATE[k] | React.SetStateAction<T_STATE[k]>;
};

export type ComponentInterceptedActions<T_STATE> = {
  [k in keyof T_STATE]?: (
    value: T_STATE[k],
    {
      actions,
      state,
    }: { actions: ComponentStateGeneratedActions<T_STATE>; state: T_STATE },
  ) => void | boolean;
};

export type ComponentMappedCallbackParams<T_STATE> = {
  [k in keyof T_STATE]: (value: T_STATE[k], state: T_STATE) => any;
};

export type ComponentStateActions<T_STATE> =
  ComponentStateGeneratedActions<T_STATE>;

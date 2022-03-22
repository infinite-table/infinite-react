import * as React from 'react';

export type RenderHookComponentProps<RENDER_FN extends Function, PARAM_TYPE> = {
  render: RENDER_FN;
  renderParam: PARAM_TYPE;
};

export function RenderHookComponent<RENDER_FN extends Function, PARAM_TYPE>(
  props: RenderHookComponentProps<RENDER_FN, PARAM_TYPE>,
) {
  return <>{props.render(props.renderParam)}</>;
}

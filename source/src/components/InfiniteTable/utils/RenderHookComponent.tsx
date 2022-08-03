import * as React from 'react';

import { InfiniteTableColumnCellContext } from '../components/InfiniteTableRow/InfiniteTableColumnCell';
import { InfiniteTableColumnCellContextType } from '../types/InfiniteTableColumn';

export type RenderHookComponentProps<RENDER_FN extends Function, PARAM_TYPE> = {
  render: RENDER_FN;
  renderParam: PARAM_TYPE;
};

export function RenderHookComponent<RENDER_FN extends Function, PARAM_TYPE>(
  props: RenderHookComponentProps<RENDER_FN, PARAM_TYPE>,
) {
  return props.render(props.renderParam) ?? null;
}

export function RenderCellHookComponent<T, RENDER_FN extends Function>(
  props: RenderHookComponentProps<
    RENDER_FN,
    InfiniteTableColumnCellContextType<T>
  >,
) {
  const ContextProvider =
    InfiniteTableColumnCellContext.Provider as React.Provider<
      InfiniteTableColumnCellContextType<T>
    >;
  return (
    <ContextProvider value={props.renderParam}>
      <RenderHookComponent
        render={props.render}
        renderParam={props.renderParam}
      />
    </ContextProvider>
  );
}

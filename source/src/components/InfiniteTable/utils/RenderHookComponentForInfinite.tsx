import * as React from 'react';
import { InfiniteTableHeaderCellContext } from '../components/InfiniteTableHeader/InfiniteTableHeaderCell';

import { InfiniteTableColumnCellContext } from '../components/InfiniteTableRow/InfiniteTableColumnCell';
import {
  InfiniteTableColumnCellContextType,
  InfiniteTableHeaderCellContextType,
} from '../types/InfiniteTableColumn';
import {
  RenderHookComponent,
  RenderHookComponentProps,
} from '../../RenderHookComponent';

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

export function CellEditorContextComponent<T>(props: {
  children: React.ReactNode;
  contextValue: InfiniteTableColumnCellContextType<T>;
}) {
  const ContextProvider =
    InfiniteTableColumnCellContext.Provider as React.Provider<
      InfiniteTableColumnCellContextType<T>
    >;
  return (
    <ContextProvider value={props.contextValue}>
      {props.children}
    </ContextProvider>
  );
}

export function RenderHeaderCellHookComponent<T, RENDER_FN extends Function>(
  props: RenderHookComponentProps<
    RENDER_FN,
    InfiniteTableHeaderCellContextType<T>
  >,
) {
  const ContextProvider =
    InfiniteTableHeaderCellContext.Provider as React.Provider<
      InfiniteTableHeaderCellContextType<T>
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

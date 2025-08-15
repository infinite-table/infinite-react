import * as React from 'react';
import { buildManagedComponent } from '../../../hooks/useComponentState';
import {
  forwardHeaderProps,
  initHeaderSetupState,
} from '../../state/getInfiniteHeaderState';
import { InfiniteTableHeaderProps } from './types';
import { getInfiniteTableHeaderContext } from './context';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { TableHeaderWrapper } from '../InfiniteTableHeader/InfiniteTableHeaderWrapper';

const { ManagedComponentContextProvider: InfiniteTableHeaderRoot } =
  buildManagedComponent({
    initSetupState: initHeaderSetupState,
    forwardProps: forwardHeaderProps,
    // @ts-ignore
    Context: getInfiniteTableHeaderContext<any>(),
  });

export function InfiniteTableHeader<T>(props: InfiniteTableHeaderProps<T>) {
  const context = useInfiniteTable<T>();

  const { state: componentState, getComputed } = context;
  const { header, brain, headerBrain, wrapRowsHorizontally } = componentState;
  const { scrollbars } = getComputed();

  return header ? (
    <InfiniteTableHeaderRoot {...props}>
      <TableHeaderWrapper
        wrapRowsHorizontally={!!wrapRowsHorizontally}
        bodyBrain={brain}
        headerBrain={headerBrain}
        scrollbars={scrollbars}
      />
    </InfiniteTableHeaderRoot>
  ) : null;
}

export function useInfiniteTableHeaderState<T>() {
  return React.useContext(getInfiniteTableHeaderContext<T>()).componentState;
}

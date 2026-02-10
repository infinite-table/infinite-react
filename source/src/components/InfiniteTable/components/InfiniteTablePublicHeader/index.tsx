import * as React from 'react';
import { buildManagedComponent } from '../../../hooks/useComponentState';
import {
  forwardHeaderProps,
  initHeaderSetupState,
} from '../../state/getInfiniteHeaderState';
import { InfiniteTableHeaderProps } from './types';
import { getInfiniteTableHeaderContext } from './context';
import { TableHeaderWrapper } from '../InfiniteTableHeader/InfiniteTableHeaderWrapper';
import { useInfiniteTableSelector } from '../../hooks/useInfiniteTableSelector';

const { ManagedComponentContextProvider: InfiniteTableHeaderRoot } =
  buildManagedComponent({
    initSetupState: initHeaderSetupState,
    forwardProps: forwardHeaderProps,
    // @ts-ignore
    Context: getInfiniteTableHeaderContext<any>(),
  });

export function InfiniteTableHeader<T>(props: InfiniteTableHeaderProps<T>) {
  const { getComputed, header, brain, headerBrain, wrapRowsHorizontally } =
    useInfiniteTableSelector((ctx) => {
      return {
        getComputed: ctx.getComputed,
        header: ctx.state.header,
        brain: ctx.state.brain,
        headerBrain: ctx.state.headerBrain,
        wrapRowsHorizontally: ctx.state.wrapRowsHorizontally,
      };
    });

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

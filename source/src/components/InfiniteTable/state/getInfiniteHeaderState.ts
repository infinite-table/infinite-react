import { ForwardPropsToStateFnResult } from '../../hooks/useComponentState';
import { ComponentStateActions } from '../../hooks/useComponentState/types';
import { NonUndefined } from '../../types/NonUndefined';
import { InfiniteTableHeaderProps } from '../components/InfiniteTablePublicHeader/types';

export type InfiniteTableHeaderSetupState<_T> = {};
export type InfiniteTableHeaderMappedState<_T> = {
  allowColumnHideWhileDragging: NonUndefined<
    InfiniteTableHeaderProps<_T>['allowColumnHideWhileDragging']
  >;
};

export type InfiniteTableHeaderDerivedState<_T> = {};

export interface InfiniteTableHeaderState<_T>
  extends InfiniteTableHeaderMappedState<_T>,
    InfiniteTableHeaderDerivedState<_T>,
    InfiniteTableHeaderSetupState<_T> {}

export type InfiniteTableHeaderActions<_T> = ComponentStateActions<
  InfiniteTableHeaderState<_T>
>;

export function initHeaderSetupState<T>(): InfiniteTableHeaderSetupState<T> {
  return {};
}

export const forwardHeaderProps = <T>(
  _setupState: InfiniteTableHeaderSetupState<T>,
): ForwardPropsToStateFnResult<
  InfiniteTableHeaderProps<T>,
  InfiniteTableHeaderMappedState<T>,
  InfiniteTableHeaderSetupState<T>
> => {
  return {
    allowColumnHideWhileDragging: (allowColumnHideWhileDragging) =>
      allowColumnHideWhileDragging ?? true,
  };
};

import { toUpperFirst } from '../../../utils/toUpperFirst';
import { useLatest } from '../../hooks/useLatest';
import { useProperty } from '../../hooks/useProperty';
import { Setter } from '../../types/Setter';
import { InfiniteTableActions } from '../state/getReducerActions';
import { InfiniteTableState } from '../types';

import { useInternalInfiniteTable } from './useInternalInfiniteTable';

export function useStateProperty<
  DATA_TYPE,
  V extends keyof T_PROPS & keyof InfiniteTableState<DATA_TYPE>,
  T_PROPS,
  NORMALIZED,
>(
  propName: V,
  props: T_PROPS,
  config: {
    defaultValue?: T_PROPS[V];

    normalize?: (v?: NORMALIZED | T_PROPS[V]) => NORMALIZED;
    onControlledChange?: (n: NORMALIZED, v: NORMALIZED | T_PROPS[V]) => void;
  } = {
    normalize: (v?: NORMALIZED | T_PROPS[V]): NORMALIZED => {
      return v as any as NORMALIZED;
    },
  },
): [NORMALIZED, Setter<NORMALIZED | T_PROPS[V]>] {
  const { actions, state } = useInternalInfiniteTable<DATA_TYPE>();

  const getActions = useLatest(actions);
  const getState = useLatest(state);

  const { fromState, setState } = (() => {
    const upperPropName = toUpperFirst(propName as string);
    const setterPropName = `set${upperPropName}` as string;

    return {
      fromState: (() =>
        getState()[propName as keyof InfiniteTableState<DATA_TYPE>]) as any as (
        defaultValue?: NORMALIZED,
      ) => NORMALIZED,
      setState: (value: NORMALIZED) => {
        const fn = getActions()[
          setterPropName as keyof InfiniteTableActions<DATA_TYPE>
        ] as any as (v: NORMALIZED) => void;

        fn(value);
      },
    };
  })();

  return useProperty(propName, props, {
    ...config,
    fromState,
    setState,
  });
}

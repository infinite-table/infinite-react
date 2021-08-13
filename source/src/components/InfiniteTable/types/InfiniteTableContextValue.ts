import * as React from 'react';
import {
  // InfiniteTableOwnProps,
  InfiniteTableProps,
} from './InfiniteTableProps';
import { InfiniteTableState } from './InfiniteTableState';
import { InfiniteTableComputedValues } from './InfiniteTableComputedValues';
import { InfiniteTableAction } from './InfiniteTableAction';
import {
  InfiniteTableActions,
  InfiniteTableInternalActions,
} from '../state/getReducerActions';
import { LazyLatest } from '../../hooks/useLazyLatest';

export interface InternalInfiniteTableContextValue<T> {
  props: InfiniteTableProps<T>;
  state: InfiniteTableState<T>;
  actions: InfiniteTableActions<T>;
  internalActions: InfiniteTableInternalActions<T>;
  dispatch: React.Dispatch<InfiniteTableAction>;
  domRef: React.MutableRefObject<HTMLDivElement | null>;
  bodyDOMRef: React.RefObject<HTMLDivElement | null>;
  portalDOMRef: React.RefObject<HTMLDivElement | null>;
  headerHeightRef: React.MutableRefObject<number>;
  getComputed: LazyLatest<InfiniteTableComputedValues<T>>;
}

export interface InfiniteTableContextValue<T>
  extends InternalInfiniteTableContextValue<T> {
  computed: InfiniteTableComputedValues<T>;
  // ownProps: InfiniteTableOwnProps<T>;
}

import * as React from 'react';
import {
  // InfiniteTableOwnProps,
  InfiniteTableProps,
} from './InfiniteTableProps';
import {
  InfiniteTableComponentActions,
  InfiniteTableComponentState,
  InfiniteTableState,
} from './InfiniteTableState';
import { InfiniteTableComputedValues } from './InfiniteTableComputedValues';
import { InfiniteTableAction } from './InfiniteTableAction';
import {
  InfiniteTableActions,
  InfiniteTableInternalActions,
} from '../state/getReducerActions';
import { LazyLatest } from '../../hooks/useLazyLatest';

export interface InfiniteTableContextValue<T> {
  componentState: InfiniteTableComponentState<T>;
  componentActions: InfiniteTableComponentActions<T>;
}

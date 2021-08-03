import * as React from 'react';
import {
  InfiniteTableOwnProps,
  InfiniteTableProps,
} from './InfiniteTableProps';
import { InfiniteTableState } from './InfiniteTableState';
import { InfiniteTableComputedValues } from './InfiniteTableComputedValues';
import { InfiniteTableAction } from './InfiniteTableAction';
import {
  InfiniteTableActions,
  InfiniteTableInternalActions,
} from '../state/getReducerActions';

export interface InfiniteTableContextValue<T> {
  props: InfiniteTableProps<T>;
  ownProps: InfiniteTableOwnProps<T>;
  state: InfiniteTableState<T>;
  computed: InfiniteTableComputedValues<T>;
  actions: InfiniteTableActions<T>;
  internalActions: InfiniteTableInternalActions<T>;
  dispatch: React.Dispatch<InfiniteTableAction>;
  domRef: React.MutableRefObject<HTMLDivElement | null>;
  bodyDOMRef: React.RefObject<HTMLDivElement | null>;
  portalDOMRef: React.RefObject<HTMLDivElement | null>;
}

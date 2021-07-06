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
import { Dispatch, MutableRefObject, RefObject } from 'react';

export interface InfiniteTableContextValue<T> {
  props: InfiniteTableProps<T>;
  ownProps: InfiniteTableOwnProps<T>;
  state: InfiniteTableState<T>;
  computed: InfiniteTableComputedValues<T>;
  actions: InfiniteTableActions<T>;
  internalActions: InfiniteTableInternalActions<T>;
  dispatch: Dispatch<InfiniteTableAction>;
  domRef: MutableRefObject<HTMLDivElement | null>;
  bodyDOMRef: RefObject<HTMLDivElement | null>;
  portalDOMRef: RefObject<HTMLDivElement | null>;
}

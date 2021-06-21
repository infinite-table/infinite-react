import { InfiniteTableProps } from './InfiniteTableProps';
import { InfiniteTableState } from './InfiniteTableState';
import { InfiniteTableComputedValues } from './InfiniteTableComputedValues';
import { InfiniteTableAction } from './InfiniteTableAction';
import { TableActions } from '../state/getReducerActions';
import { Dispatch, MutableRefObject, RefObject } from 'react';

export interface InfiniteTableContextValue<T> {
  props: InfiniteTableProps<T>;
  state: InfiniteTableState<T>;
  computed: InfiniteTableComputedValues<T>;
  actions: TableActions<T>;
  dispatch: Dispatch<InfiniteTableAction>;
  domRef: MutableRefObject<HTMLDivElement | null>;
  bodyDOMRef: RefObject<HTMLDivElement | null>;
  portalDOMRef: RefObject<HTMLDivElement | null>;
}

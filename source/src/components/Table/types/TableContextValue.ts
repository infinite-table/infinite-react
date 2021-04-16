import { TableProps } from './TableProps';
import { TableState } from './TableState';
import { TableComputedValues } from './TableComputedValues';
import { TableAction } from './TableAction';
import { TableActions } from '../state/getReducerActions';
import { Dispatch, MutableRefObject, RefObject } from 'react';

export interface TableContextValue<T> {
  props: TableProps<T>;
  state: TableState<T>;
  computed: TableComputedValues<T>;
  actions: TableActions<T>;
  dispatch: Dispatch<TableAction>;
  domRef: MutableRefObject<HTMLDivElement | null>;
  bodyDOMRef: RefObject<HTMLDivElement | null>;
  portalDOMRef: RefObject<HTMLDivElement | null>;
}

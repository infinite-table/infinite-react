import * as React from 'react';
import type { DataSourcePropGroupBy } from '../../../DataSource/types';
import type { InfiniteTableComputedColumn } from '../../types';
import {
  GroupingToolbarItemClearCls,
  GroupingToolbarPlaceholderCls,
} from './index.css';

import { ClearIcon } from '../icons/ClearIcon';

export function HostDefault(props: {
  active: boolean;
  orientation: 'horizontal' | 'vertical';
  rejectDrop: boolean;
  domProps?: React.HTMLAttributes<HTMLDivElement>;
}) {
  return <div {...props.domProps} />;
}
export function PlaceholderDefault<T = any>(props: {
  draggingInProgress: boolean;
  active: boolean;
  groupBy: DataSourcePropGroupBy<T>;
}): React.ReactNode {
  const { active } = props;

  return (
    <div className={GroupingToolbarPlaceholderCls}>
      {active ? 'Drop to group' : 'Drag columns to group'}
    </div>
  );
}

export function GroupingToolbarItemDefault<T = any>(props: {
  domProps?: React.HTMLAttributes<HTMLDivElement>;
  column: InfiniteTableComputedColumn<T> | undefined;
  field: string | number | undefined;
  active: boolean;
  label: React.ReactNode;
  onClear: () => void;
}) {
  const clearOnEnterOrSpace = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      props.onClear?.();
    }
  };
  return (
    <div {...props.domProps}>
      {props.label}
      <div
        tabIndex={0}
        role="button"
        aria-label={`Clear grouping by ${props.field}`}
        className={GroupingToolbarItemClearCls}
        onKeyDown={clearOnEnterOrSpace}
        onMouseDown={props.onClear}
      >
        <ClearIcon size={20} />
      </div>
    </div>
  );
}

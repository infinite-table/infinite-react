import * as React from 'react';
import {
  GroupingToolbarBaseCls,
  GroupingToolbarItemCls,
  GroupingToolbarPlaceholderCls,
} from './index.css';
import { useDataSourceState } from '../../../DataSource';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { ClearIcon } from '../icons/ClearIcon';

type GroupingToolbarProps = {};

export function GroupingToolbar<T = any>(_props: GroupingToolbarProps) {
  const { groupBy } = useDataSourceState<T>();

  const { getComputed, dataSourceApi } = useInfiniteTable<T>();

  const { fieldsToColumn } = getComputed();

  const [over, setOver] = React.useState(false);

  const placeholderMessage = over ? 'Drop to group' : 'Drag columns to group';

  const children = !groupBy.length ? (
    <div className={GroupingToolbarPlaceholderCls}>{placeholderMessage}</div>
  ) : (
    <>
      {groupBy.map((group) => {
        const column = group.field
          ? fieldsToColumn.get(group.field)
          : undefined;

        return (
          <div key={group.field} className={GroupingToolbarItemCls}>
            {column?.header && typeof column.header !== 'function'
              ? column.header
              : column?.name || column?.id || ''}

            <div
              tabIndex={-1}
              onClick={() => {
                dataSourceApi.setGroupBy(groupBy.filter((g) => g !== group));
              }}
            >
              <ClearIcon />
            </div>
          </div>
        );
      })}
    </>
  );

  return (
    <div className={GroupingToolbarBaseCls}>
      <button onClick={() => setOver(!over)}>toggle over</button>
      {children}
    </div>
  );
}

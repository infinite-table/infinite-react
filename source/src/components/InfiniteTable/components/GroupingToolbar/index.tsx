import * as React from 'react';
import {
  GroupingToolbarRecipe,
  GroupingToolbarItemClearCls,
  GroupingToolbarItemRecipe,
  GroupingToolbarPlaceholderCls,
} from './index.css';
import { useDataSourceState } from '../../../DataSource';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { ClearIcon } from '../icons/ClearIcon';
import { DragList } from '../draggable';
import { join } from '../../../../utils/join';
import { InfiniteTableComputedColumn } from '../../types';
import { useDragDropProvider } from '../draggable/DragDropProvider';

type GroupingToolbarProps = {};

export function GroupingToolbarItem<T = any>(props: {
  domProps?: React.HTMLAttributes<HTMLDivElement>;
  column: InfiniteTableComputedColumn<T> | undefined;

  onClear?: () => void;
}) {
  const column = props.column;

  const { dragSourceListId } = useDragDropProvider();

  const draggingInProgress = dragSourceListId === 'grouping-toolbar';

  return (
    <div
      {...props.domProps}
      className={join(
        GroupingToolbarItemRecipe({
          draggingInProgress,
        }),
        props.domProps?.className,
      )}
    >
      {column?.header && typeof column.header !== 'function'
        ? column.header
        : column?.name || column?.id || ''}

      <div
        tabIndex={-1}
        className={GroupingToolbarItemClearCls}
        onClick={props.onClear}
      >
        <ClearIcon />
      </div>
    </div>
  );
}

export function GroupingToolbar<T = any>(_props: GroupingToolbarProps) {
  const { groupBy } = useDataSourceState<T>();

  const { getComputed, dataSourceApi } = useInfiniteTable<T>();

  const { fieldsToColumn } = getComputed();

  const placeholderMessage = 'Drag columns to group';

  const children = !groupBy.length ? (
    <div className={GroupingToolbarPlaceholderCls}>{placeholderMessage}</div>
  ) : (
    <>
      {groupBy.map((group, index) => {
        const column = group.field
          ? fieldsToColumn.get(group.field)
          : undefined;

        const id = group.field ?? `idx-${index}`;

        return (
          <DragList.DraggableItem key={id} id={id}>
            {(domProps) => {
              return (
                <GroupingToolbarItem
                  domProps={domProps}
                  column={column}
                  onClear={() => {
                    dataSourceApi.setGroupBy(
                      groupBy.filter((g) => g !== group),
                    );
                  }}
                />
              );
            }}
          </DragList.DraggableItem>
        );
      })}
    </>
  );

  const onDrop = (sortedIndexes: number[]) => {
    const newGroupBy = sortedIndexes.map((index) => groupBy[index]);
    dataSourceApi.setGroupBy(newGroupBy);
  };

  return (
    <DragList
      orientation="horizontal"
      dragListId="grouping-toolbar"
      onDrop={onDrop}
    >
      {(domProps, { draggingInProgress }) => {
        return (
          <div
            {...domProps}
            className={join(
              GroupingToolbarRecipe({
                draggingInProgress,
              }),
              domProps.className,
            )}
          >
            {children}
          </div>
        );
      }}
    </DragList>
  );
}

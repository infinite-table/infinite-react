import * as React from 'react';
import { useCallback } from 'react';
import { GroupingToolbarRecipe, GroupingToolbarItemRecipe } from './index.css';

import { DataSourcePropGroupBy, useDataSourceState } from '../../../DataSource';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { DragList } from '../draggable';
import { join } from '../../../../utils/join';
import { InfiniteTableComputedColumn } from '../../types';
import { useDragDropProvider } from '../draggable/DragDropProvider';
import { DragListProps, useDragListContext } from '../draggable/DragList';
import { getColumnLabel } from '../InfiniteTableHeader/getColumnLabel';

import { DragInteractionTargetMoveEvent } from '../draggable/DragInteractionTarget';
import {
  PlaceholderDefault,
  GroupingToolbarItemDefault,
  HostDefault,
} from './components';

export type GroupingToolbarProps = {
  orientation?: 'horizontal' | 'vertical';
  placeholder?: <T = any>(params: {
    draggingInProgress: boolean;
    active: boolean;
    groupBy: DataSourcePropGroupBy<T>;
  }) => React.ReactNode;
  domProps?: React.HTMLAttributes<HTMLDivElement>;
  components?: {
    Host?: typeof HostDefault;
    Placeholder?: typeof PlaceholderDefault;
    ToolbarItem?: typeof GroupingToolbarItemDefault;
  };
};

export function GroupingToolbarItem<T = any>(props: {
  id: string;
  domProps?: React.HTMLAttributes<HTMLDivElement>;
  column: InfiniteTableComputedColumn<T> | undefined;
  field: string | number | undefined;
  components?: GroupingToolbarProps['components'];
  onClear: () => void;
}) {
  const { column, onClear, components, field, id } = props;

  const { dragSourceListId, dragItemId } = useDragListContext();

  const draggingInProgress = dragSourceListId === GROUPING_TOOLBAR_DRAG_LIST_ID;

  const context = useInfiniteTable<T>();

  const header: React.ReactNode =
    (column ? getColumnLabel(column.id, context, 'grouping-toolbar') : field) ??
    id;

  const active =
    dragItemId === id && dragSourceListId === GROUPING_TOOLBAR_DRAG_LIST_ID;

  const className = join(
    GroupingToolbarItemRecipe({
      draggingInProgress,
      active,
    }),
    props.domProps?.className,
  );

  const domProps: React.HTMLAttributes<HTMLDivElement> = {
    ...props.domProps,
    className,
  };

  const Cmp = components?.ToolbarItem ?? GroupingToolbarItemDefault;

  return (
    <Cmp
      active={active}
      domProps={domProps}
      column={column}
      field={field}
      label={header}
      onClear={onClear}
    />
  );
}

const GROUPING_TOOLBAR_DRAG_LIST_ID = 'grouping-toolbar';

export function GroupingToolbar<T = any>(props: GroupingToolbarProps) {
  const { groupBy } = useDataSourceState<T>();
  const { getComputed, dataSourceApi } = useInfiniteTable<T>();
  const { dropTargetListId, dragSourceListId } = useDragDropProvider();
  const { fieldsToColumn, computedColumnsMap } = getComputed();

  const active = dropTargetListId === GROUPING_TOOLBAR_DRAG_LIST_ID;
  const draggingInProgress = dragSourceListId === GROUPING_TOOLBAR_DRAG_LIST_ID;

  const PlaceholderComponent = (props.components?.Placeholder ??
    PlaceholderDefault) as typeof PlaceholderDefault;

  const HostComponent = props.components?.Host ?? HostDefault;

  const children = !groupBy.length ? (
    <PlaceholderComponent<T>
      draggingInProgress={draggingInProgress}
      active={active}
      groupBy={groupBy}
    />
  ) : (
    <>
      {groupBy.map((group, index) => {
        const column = group.field
          ? fieldsToColumn.get(group.field)
          : undefined;

        const id = `${group.field ?? `idx-${index}`}`;

        return (
          <DragList.DraggableItem key={id} id={id}>
            {(domProps) => {
              return (
                <GroupingToolbarItem
                  id={id}
                  components={props.components}
                  domProps={domProps}
                  field={group.field}
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

  const onAcceptDrop: DragListProps['onAcceptDrop'] = (params) => {
    const { dragItemId } = params;
    const dragColumnId = dragItemId as string;

    const dragColumn = computedColumnsMap.get(dragColumnId);

    if (!dragColumn || !dragColumn.field || !dragColumn.computedGroupable) {
      return;
    }

    const newGroupBy = [...groupBy];

    newGroupBy.splice(params.dropIndex, 0, {
      field: dragColumn.field,
    });

    dataSourceApi.setGroupBy(newGroupBy);
  };

  const shouldAcceptDrop = useCallback(
    (event: DragInteractionTargetMoveEvent) => {
      const { computedColumnsMap } = getComputed();

      const columnId = event.dragItem.id;
      const column = computedColumnsMap.get(columnId);

      if (!column || !column.computedGroupable) {
        return false;
      }

      if (groupBy.some((g) => g.field === column.field)) {
        return false;
      }

      return true;
    },
    [groupBy],
  );

  const orientation = props.orientation ?? 'horizontal';
  const { domProps: groupingToolbarDOMProps } = props;
  return (
    <DragList
      orientation={orientation}
      dragListId={GROUPING_TOOLBAR_DRAG_LIST_ID}
      acceptDropsFrom={['header', GROUPING_TOOLBAR_DRAG_LIST_ID]}
      onDrop={onDrop}
      onAcceptDrop={onAcceptDrop}
      shouldAcceptDrop={shouldAcceptDrop}
    >
      {(domProps, { draggingInProgress, status }) => {
        const className = join(
          GroupingToolbarRecipe({
            active,
            orientation,
            draggingInProgress,
            dropRejected: status === 'rejected',
          }),
          domProps.className,
          groupingToolbarDOMProps?.className,
        );

        const allDomProps: React.HTMLAttributes<HTMLDivElement> = {
          ...domProps,
          ...groupingToolbarDOMProps,
          className,
          children,
        };

        return (
          <HostComponent
            active={active}
            rejectDrop={status === 'rejected'}
            domProps={allDomProps}
            orientation={orientation}
          />
        );
      }}
    </DragList>
  );
}

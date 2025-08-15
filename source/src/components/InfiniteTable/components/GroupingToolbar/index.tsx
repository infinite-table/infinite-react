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
import { SortIcon } from '../icons/SortIcon';
import { alignItems, display, flexFlow, gap } from '../../utilities.css';
import { getGlobal } from '../../../../utils/getGlobal';

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

const getFastClickHandler = (
  callback: () => void,
  prevHandler?: (e: React.MouseEvent<HTMLDivElement>) => void,
) => {
  return (e: React.MouseEvent<HTMLDivElement>) => {
    if (prevHandler) {
      prevHandler(e);
    }

    const now = Date.now();
    let moved: boolean = false;
    const moveHandler = () => {
      moved = true;
    };
    getGlobal().addEventListener('mousemove', moveHandler, {
      once: true,
    });

    getGlobal().addEventListener(
      'mouseup',
      () => {
        // if there was a drag, don't act

        if (!moved) {
          getGlobal().removeEventListener('mousemove', moveHandler);

          // don't act if we had a long press....
          if (Date.now() - now < 200) {
            requestAnimationFrame(() => {
              callback();
            });
          }
        }
      },
      {
        once: true,
      },
    );
  };
};

export function GroupingToolbarItem<T = any>(props: {
  id: string;
  domProps?: React.HTMLAttributes<HTMLDivElement>;
  column: InfiniteTableComputedColumn<T> | undefined;
  field: string | number | undefined;
  components?: GroupingToolbarProps['components'];
  onClear: () => void;
  toggleSorting: () => void;
}) {
  const { column, onClear, components, field, id, toggleSorting } = props;

  const { dragSourceListId, dragItemId } = useDragListContext();

  const draggingInProgress = dragSourceListId === GROUPING_TOOLBAR_DRAG_LIST_ID;

  const context = useInfiniteTable<T>();

  const columnHeader: React.ReactNode =
    (column ? getColumnLabel(column.id, context, 'grouping-toolbar') : field) ??
    id;

  const sortIcon = column ? (
    <SortIcon
      forceSize
      size={20}
      direction={
        column.computedSortedAsc ? 1 : column.computedSortedDesc ? -1 : 0
      }
    />
  ) : null;

  const header = (
    <div className={join(display.flex, flexFlow.row, gap[2], alignItems.end)}>
      {columnHeader}
      {sortIcon}
    </div>
  );

  const active =
    dragItemId === id && dragSourceListId === GROUPING_TOOLBAR_DRAG_LIST_ID;

  const className = join(
    GroupingToolbarItemRecipe({
      draggingInProgress,
      active,
    }),
    props.domProps?.className,
  );
  const onMouseDown = getFastClickHandler(
    toggleSorting,
    props.domProps?.onMouseDown,
  );

  const domProps: React.HTMLAttributes<HTMLDivElement> = {
    ...props.domProps,
    className,
    onMouseDown,
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
  const { getComputed, dataSourceApi, api } = useInfiniteTable<T>();
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
                  toggleSorting={() => {
                    if (column) {
                      api.toggleSortingForColumn(column.id);
                    }
                  }}
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

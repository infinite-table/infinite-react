import * as React from 'react';

import { DragDropProvider, DragList } from '@infinite-table/infinite-react';

type ColumnId = 'todo' | 'inprogress' | 'done';

type Task = {
  id: number;
  title: string;
};

type Column = {
  id: ColumnId;
  title: string;
  color: string;
  tasks: Task[];
};

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    color: '#64748b',
    tasks: [
      { id: 1, title: 'Write acceptance criteria for signup flow' },
      { id: 2, title: 'Create API contract for project comments' },
      { id: 3, title: 'Review design for dashboard filters' },
      { id: 4, title: 'Add keyboard navigation to modals' },
    ],
  },
  {
    id: 'inprogress',
    title: 'In Progress',
    color: '#f59e0b',
    tasks: [
      { id: 5, title: 'Implement CSV export on reports page' },
      { id: 6, title: 'Fix stale cache issue in user profile' },
      { id: 7, title: 'Optimize row virtualization performance' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    color: '#22c55e',
    tasks: [
      { id: 8, title: 'Ship table sorting persistence' },
      { id: 9, title: 'Add empty state illustrations' },
      { id: 10, title: 'Refactor API error boundary handling' },
    ],
  },
];

const columnListId = 'board-columns';
const getTaskListId = (columnId: ColumnId) => `tasks:${columnId}`;
const isTaskListId = (listId: string | null | undefined) =>
  !!listId && listId.startsWith('tasks:');
const getColumnIdFromTaskListId = (listId: string) =>
  listId.replace('tasks:', '') as ColumnId;

function ColumnCard(props: {
  column: Column;
  domProps: React.HTMLProps<HTMLDivElement>;
  children: React.ReactNode;
  active: boolean;
  draggingInProgress: boolean;
  isTaskDropTarget: boolean;
}) {
  const {
    column,
    domProps,
    children,
    active,
    draggingInProgress,
    isTaskDropTarget,
  } = props;
  const { onPointerDown, className: _className, ...restDomProps } = domProps;

  return (
    <div
      {...restDomProps}
      style={{
        width: 320,
        borderRadius: 12,
        border: active ? '2px solid #6366f1' : '1px solid #e2e8f0',
        background: active ? '#eef2ff' : '#fff',
        boxShadow: active
          ? '0 10px 24px rgba(99,102,241,0.25)'
          : '0 1px 3px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        opacity: draggingInProgress && !active ? 0.95 : 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            onPointerDown={onPointerDown}
            style={{
              cursor: 'grab',
              color: '#94a3b8',
              borderRadius: 4,
              lineHeight: 1,
              padding: '2px 4px',
            }}
          >
            ⠿
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
            {column.title}
          </span>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
            background: column.color,
            borderRadius: 999,
            padding: '2px 8px',
          }}
        >
          {column.tasks.length}
        </span>
      </div>
      <div
        style={{
          padding: 10,
          background: isTaskDropTarget ? '#f0fdf4' : '#fff',
          transition: 'background 0.15s',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function TaskCard(props: {
  task: Task;
  domProps: React.HTMLProps<HTMLDivElement>;
  active: boolean;
  draggingInProgress: boolean;
}) {
  const { task, domProps, active, draggingInProgress } = props;
  const { onPointerDown, className: _className, ...restDomProps } = domProps;

  return (
    <div
      {...restDomProps}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderRadius: 8,
        border: active ? '2px solid #6366f1' : '1px solid #e2e8f0',
        background: active ? '#e0e7ff' : '#fff',
        boxShadow: active
          ? '0 6px 16px rgba(99,102,241,0.25)'
          : '0 1px 2px rgba(0,0,0,0.05)',
        padding: '8px 10px',
        cursor: 'grab',
        userSelect: 'none',
        opacity: draggingInProgress && !active ? 0.95 : 1,
      }}
    >
      <div
        onPointerDown={onPointerDown}
        style={{
          cursor: 'grab',
          color: '#94a3b8',
          lineHeight: 1,
          padding: '2px 4px',
          borderRadius: 4,
          flexShrink: 0,
        }}
      >
        ⠿
      </div>
      <div
        style={{
          fontSize: 13,
          color: '#1e293b',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
          flex: 1,
        }}
      >
        {task.title}
      </div>
    </div>
  );
}

export default function NestedListsDndExample() {
  const [columns, setColumns] = React.useState<Column[]>(initialColumns);

  const allTaskListIds = React.useMemo(
    () => columns.map((column) => getTaskListId(column.id)),
    [columns],
  );

  const onDropColumns = React.useCallback((sortedIndexes: number[]) => {
    setColumns((prev) => sortedIndexes.map((index) => prev[index]));
  }, []);

  const onDropTasks = React.useCallback(
    (columnId: ColumnId) => (sortedIndexes: number[]) => {
      setColumns((prev) =>
        prev.map((column) => {
          if (column.id !== columnId) {
            return column;
          }

          return {
            ...column,
            tasks: sortedIndexes.map((index) => column.tasks[index]),
          };
        }),
      );
    },
    [],
  );

  const onRemoveTasks = React.useCallback(
    (columnId: ColumnId) => (sortedIndexes: number[]) => {
      setColumns((prev) =>
        prev.map((column) => {
          if (column.id !== columnId) {
            return column;
          }

          return {
            ...column,
            tasks: sortedIndexes.map((index) => column.tasks[index]),
          };
        }),
      );
    },
    [],
  );

  const onAcceptDropTask = React.useCallback(
    (targetColumnId: ColumnId) =>
      (params: {
        dragItemId: string;
        dragSourceListId: string;
        dragIndex: number;
        dropIndex: number;
      }) => {
        setColumns((prev) => {
          if (!isTaskListId(params.dragSourceListId)) {
            return prev;
          }

          const sourceColumnId = getColumnIdFromTaskListId(
            params.dragSourceListId,
          );

          if (sourceColumnId === targetColumnId) {
            return prev;
          }

          const sourceColumn = prev.find(
            (column) => column.id === sourceColumnId,
          );
          const draggedTask = sourceColumn?.tasks.find(
            (task) => `${task.id}` === params.dragItemId,
          );

          if (!draggedTask) {
            return prev;
          }

          return prev.map((column) => {
            if (column.id !== targetColumnId) {
              return column;
            }

            const nextTasks = [...column.tasks];
            const insertIndex = Math.max(
              0,
              Math.min(params.dropIndex, nextTasks.length),
            );
            nextTasks.splice(insertIndex, 0, draggedTask);

            return {
              ...column,
              tasks: nextTasks,
            };
          });
        });
      },
    [],
  );

  return (
    <DragDropProvider>
      {({ dropTargetListId }) => (
        <div
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            background: '#f8fafc',
            minHeight: '100vh',
            padding: 24,
          }}
        >
          <h1
            style={{
              margin: 0,
              marginBottom: 8,
              fontSize: 22,
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            Nested DnD Board
          </h1>
          <p
            style={{
              marginTop: 0,
              marginBottom: 20,
              fontSize: 14,
              color: '#64748b',
            }}
          >
            Reorder columns and move tasks across columns. Tasks can also be
            reordered inside each column.
          </p>

          <DragList
            orientation="horizontal"
            dragListId={columnListId}
            onDrop={onDropColumns}
            acceptDropsFrom={[columnListId]}
            dragStrategy="proxy"
          >
            {(columnListDomProps) => (
              <div
                {...columnListDomProps}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  overflowX: 'auto',
                  paddingBottom: 8,
                }}
              >
                {columns.map((column) => (
                  <DragList.DraggableItem key={column.id} id={column.id}>
                    {(columnDomProps, columnMeta) => (
                      <ColumnCard
                        column={column}
                        domProps={columnDomProps}
                        active={columnMeta.active}
                        draggingInProgress={columnMeta.draggingInProgress}
                        isTaskDropTarget={
                          dropTargetListId === getTaskListId(column.id)
                        }
                      >
                        <DragList
                          orientation="vertical"
                          dragListId={getTaskListId(column.id)}
                          onDrop={onDropTasks(column.id)}
                          onRemove={onRemoveTasks(column.id)}
                          onAcceptDrop={onAcceptDropTask(column.id)}
                          removeOnDropOutside
                          acceptDropsFrom={allTaskListIds}
                          dragStrategy="proxy"
                        >
                          {(taskListDomProps) => (
                            <div
                              {...taskListDomProps}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                                minHeight: 170,
                              }}
                            >
                              {column.tasks.map((task) => (
                                <DragList.DraggableItem
                                  key={task.id}
                                  id={task.id}
                                  dragListId={getTaskListId(column.id)}
                                >
                                  {(taskDomProps, taskMeta) => (
                                    <TaskCard
                                      task={task}
                                      domProps={taskDomProps}
                                      active={taskMeta.active}
                                      draggingInProgress={
                                        taskMeta.draggingInProgress
                                      }
                                    />
                                  )}
                                </DragList.DraggableItem>
                              ))}

                              {column.tasks.length === 0 ? (
                                <div
                                  style={{
                                    border: '2px dashed #e2e8f0',
                                    borderRadius: 8,
                                    padding: '16px 12px',
                                    color: '#94a3b8',
                                    fontSize: 13,
                                    textAlign: 'center',
                                  }}
                                >
                                  Drop tasks here
                                </div>
                              ) : null}
                            </div>
                          )}
                        </DragList>
                      </ColumnCard>
                    )}
                  </DragList.DraggableItem>
                ))}
              </div>
            )}
          </DragList>
        </div>
      )}
    </DragDropProvider>
  );
}

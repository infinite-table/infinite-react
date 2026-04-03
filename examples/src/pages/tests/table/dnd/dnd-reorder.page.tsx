import * as React from 'react';

import { DragList, DragDropProvider } from '@infinite-table/infinite-react';

type Task = {
  id: number;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  status: string;
};

const PRIORITIES: Task['priority'][] = ['low', 'medium', 'high', 'critical'];
const STATUSES = [
  'Backlog',
  'To Do',
  'In Progress',
  'In Review',
  'Done',
  'Deployed',
];
const ASSIGNEES = [
  'Alice Chen',
  'Bob Martinez',
  'Carol Wu',
  'David Kim',
  'Eva Patel',
  'Frank Okafor',
  'Grace Lee',
  'Hassan Ali',
];
const TASK_TITLES = [
  'Fix login redirect loop',
  'Add dark mode toggle',
  'Migrate to new API v3',
  'Update onboarding flow',
  'Optimize image pipeline',
  'Add export to CSV',
  'Fix timezone bug in calendar',
  'Implement SSO integration',
  'Redesign settings page',
  'Add rate limiting middleware',
  'Fix memory leak in websocket',
  'Create admin dashboard',
  'Add two-factor auth',
  'Refactor payment module',
  'Improve search relevance',
  'Add push notifications',
  'Fix CORS issue on staging',
  'Add audit logging',
  'Optimize database queries',
  'Migrate to TypeScript strict',
  'Add E2E test suite',
  'Fix broken pagination',
  'Add role-based permissions',
  'Implement file upload',
  'Fix date picker on Safari',
  'Add keyboard shortcuts',
  'Optimize bundle size',
  'Add analytics dashboard',
  'Fix scroll position on nav',
  'Add batch operations',
  'Improve error messages',
  'Add auto-save for drafts',
  'Fix email template rendering',
  'Add multi-language support',
  'Implement undo/redo',
  'Fix race condition in checkout',
  'Add custom theme builder',
  'Optimize API response times',
  'Add data validation layer',
  'Fix accessibility violations',
  'Add webhook integrations',
  'Implement lazy loading',
  'Fix PDF export alignment',
  'Add real-time collaboration',
  'Optimize CSS bundle',
  'Add user activity feed',
  'Fix session timeout handling',
  'Add drag-and-drop upload',
  'Implement cache invalidation',
  'Add status page monitoring',
];

function generateTasks(count: number): Task[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: TASK_TITLES[i % TASK_TITLES.length],
    priority: PRIORITIES[i % PRIORITIES.length],
    assignee: ASSIGNEES[i % ASSIGNEES.length],
    status: STATUSES[i % STATUSES.length],
  }));
}

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  low: '#94a3b8',
  medium: '#3b82f6',
  high: '#f59e0b',
  critical: '#ef4444',
};

const PRIORITY_BG: Record<Task['priority'], string> = {
  low: '#f1f5f9',
  medium: '#eff6ff',
  high: '#fffbeb',
  critical: '#fef2f2',
};

function TaskRow(props: {
  task: Task;
  active: boolean;
  draggingInProgress: boolean;
  domProps: React.HTMLProps<HTMLDivElement>;
  index: number;
}) {
  const { task, active, draggingInProgress, domProps, index } = props;
  const { onPointerDown, className: _cls, ...restDomProps } = domProps;
  const priorityColor = PRIORITY_COLORS[task.priority];
  const priorityBg = PRIORITY_BG[task.priority];

  return (
    <div
      {...restDomProps}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        borderBottom: '1px solid #f1f5f9',
        background: active
          ? '#e0e7ff'
          : draggingInProgress
          ? '#fafafa'
          : index % 2 === 0
          ? '#fff'
          : '#fafbfc',
        cursor: 'grab',
        userSelect: 'none',
        transition: 'background 0.1s',
        boxShadow: active ? '0 4px 16px rgba(99,102,241,0.2)' : 'none',
        borderRadius: active ? 8 : 0,
        border: active ? '2px solid #6366f1' : 'none',
        zIndex: active ? 1000000 : 'auto',
        position: active ? 'relative' : 'static',
      }}
    >
      {/* Drag handle */}
      <div
        onPointerDown={onPointerDown}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          cursor: 'grab',
          padding: '4px 2px',
          borderRadius: 4,
          color: '#cbd5e1',
          fontSize: 16,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ⠿
      </div>

      {/* Row number */}
      <div
        style={{
          width: 32,
          fontSize: 12,
          color: '#94a3b8',
          fontVariantNumeric: 'tabular-nums',
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        {index + 1}
      </div>

      {/* Priority badge */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: priorityColor,
          background: priorityBg,
          borderRadius: 4,
          padding: '2px 8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          flexShrink: 0,
          width: 60,
          textAlign: 'center',
        }}
      >
        {task.priority}
      </div>

      {/* Title */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontWeight: 500,
          fontSize: 14,
          color: '#1e293b',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {task.title}
      </div>

      {/* Assignee */}
      <div
        style={{
          fontSize: 13,
          color: '#64748b',
          flexShrink: 0,
          width: 110,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {task.assignee}
      </div>

      {/* Status */}
      <div
        style={{
          fontSize: 12,
          color: '#64748b',
          background: '#f1f5f9',
          borderRadius: 4,
          padding: '2px 8px',
          flexShrink: 0,
          width: 80,
          textAlign: 'center',
        }}
      >
        {task.status}
      </div>

      {/* ID */}
      <div
        style={{
          fontSize: 11,
          color: '#a1a1aa',
          fontVariantNumeric: 'tabular-nums',
          flexShrink: 0,
          width: 40,
          textAlign: 'right',
        }}
      >
        #{task.id}
      </div>
    </div>
  );
}

export default function DndReorderExample() {
  const [tasks, setTasks] = React.useState<Task[]>(() => generateTasks(50));
  const [strategy, setStrategy] = React.useState<'inline' | 'proxy'>('proxy');

  const onDrop = React.useCallback((sortedIndexes: number[]) => {
    setTasks((prev) => sortedIndexes.map((i) => prev[i]));
  }, []);

  return (
    <DragDropProvider>
      {({ dropTargetListId }) => {
        const isActive = dropTargetListId === 'tasks';

        return (
          <div
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              padding: 32,
              minHeight: '100vh',
              background: '#f8fafc',
            }}
          >
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: 8,
              }}
            >
              Drag &amp; Drop: Reorderable List
            </h1>
            <p
              style={{
                fontSize: 14,
                color: '#64748b',
                marginBottom: 12,
              }}
            >
              Drag items by the handle on the left to reorder. The list is
              scrollable — try dragging items across the visible area.
            </p>

            <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
              {(['inline', 'proxy'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStrategy(s)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 6,
                    border:
                      strategy === s
                        ? '2px solid #6366f1'
                        : '1px solid #cbd5e1',
                    background: strategy === s ? '#eef2ff' : '#fff',
                    color: strategy === s ? '#4338ca' : '#64748b',
                    fontWeight: strategy === s ? 600 : 400,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {s}
                </button>
              ))}
              <span
                style={{ fontSize: 12, color: '#94a3b8', alignSelf: 'center' }}
              >
                Strategy: <b>{strategy}</b> — proxy creates a floating clone not
                clipped by overflow
              </span>
            </div>

            <div
              style={{
                maxWidth: 820,
                background: '#fff',
                borderRadius: 12,
                border: isActive ? '2px solid #6366f1' : '2px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Table header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 16px',
                  borderBottom: '2px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <div style={{ width: 24 }} />
                <div style={{ width: 32, textAlign: 'right' }}>#</div>
                <div style={{ width: 60, textAlign: 'center' }}>Priority</div>
                <div style={{ flex: 1 }}>Task</div>
                <div style={{ width: 110 }}>Assignee</div>
                <div style={{ width: 80, textAlign: 'center' }}>Status</div>
                <div style={{ width: 40, textAlign: 'right' }}>ID</div>
              </div>

              <DragList
                orientation="vertical"
                dragListId="tasks"
                onDrop={onDrop}
                acceptDropsFrom={['tasks']}
                dragStrategy={strategy}
              >
                {(domProps) => (
                  <div
                    {...domProps}
                    style={{
                      maxHeight: '65vh',
                      overflowY: 'auto',
                    }}
                  >
                    {tasks.map((task, index) => (
                      <DragList.DraggableItem key={task.id} id={task.id}>
                        {(itemDomProps, { active, draggingInProgress }) => (
                          <TaskRow
                            task={task}
                            active={active}
                            draggingInProgress={draggingInProgress}
                            domProps={itemDomProps}
                            index={index}
                          />
                        )}
                      </DragList.DraggableItem>
                    ))}
                  </div>
                )}
              </DragList>

              {/* Footer */}
              <div
                style={{
                  padding: '10px 16px',
                  borderTop: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: 13,
                  color: '#94a3b8',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{tasks.length} tasks</span>
                <span>Drag to reorder</span>
              </div>
            </div>
          </div>
        );
      }}
    </DragDropProvider>
  );
}

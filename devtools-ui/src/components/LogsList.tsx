import {
  DataSource,
  DataSourceSortInfo,
  InfiniteTable,
  InfiniteTableColumn,
  InfiniteTableRowStyleFn,
} from '@infinite-table/infinite-react';

import { DevToolsLogEntry, useLogs } from '../lib/DevToolsMessagingContext';

import { useCallback } from 'react';
import { Button } from './ui/button';
import { IGNORE_DEBUG_IDS } from './ignoreDebugIds';

type LogsListProps = {
  debugId?: string;
};

const columns: Record<string, InfiniteTableColumn<DevToolsLogEntry>> = {
  message: {
    field: 'message',
    header: 'Message',
    minWidth: 200,
    defaultFlex: 3,
  },

  timestamp: {
    field: 'timestamp',
    header: 'Timestamp',
    renderValue: ({ value }) => {
      const date = new Date(value);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()} ${date.getMilliseconds()}ms`;
    },
  },
  channel: {
    field: 'channel',
    header: 'Channel',
    defaultFlex: 1,
    minWidth: 200,
  },
  type: {
    field: 'type',
    header: 'Type',
  },
};

const domProps = {
  className: 'flex-1 flex',
};

const defaultSortInfo: DataSourceSortInfo<DevToolsLogEntry> = [
  {
    field: 'timestamp',
    dir: -1,
  },
];
export function LogsList(props: LogsListProps) {
  const { logs, clearLogs } = useLogs(props.debugId);

  const rowStyle: InfiniteTableRowStyleFn<DevToolsLogEntry> = useCallback(
    (options) => {
      return {
        color: options.data?.color || 'currentColor',
      };
    },
    [],
  );

  const debugId = props.debugId
    ? IGNORE_DEBUG_IDS.LOG_LIST_ONE
    : IGNORE_DEBUG_IDS.LOG_LIST_ALL;

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Currently {logs.length} log messages
        </span>
        <Button
          variant={'ghost'}
          onClick={() => clearLogs(props.debugId)}
          disabled={logs.length === 0}
        >
          Clear all
        </Button>
      </div>
      <DataSource
        debugId={debugId}
        data={logs}
        primaryKey={'index'}
        defaultSortInfo={defaultSortInfo}
      >
        <InfiniteTable
          debugId={debugId}
          rowHeight={30}
          columns={columns}
          columnDefaultWidth={80}
          domProps={domProps}
          rowStyle={rowStyle}
        />
      </DataSource>
    </div>
  );
}

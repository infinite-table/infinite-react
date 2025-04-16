import * as React from 'react';
import type { DevToolsHostPageMessagePayload } from '@infinite-table/infinite-react';
import { useMemo } from 'react';

export type PageData = {
  instances: Record<string, DevToolsHostPageMessagePayload>;
  logsPerInstance: Record<string, DevToolsLogEntry[]>;
  allLogs: DevToolsLogEntry[];
};

export type DevToolsLogEntry = {
  type: 'log' | 'warn' | 'error';
  message: string;
  channel: string;
  timestamp: number;
  color: string;
  index: number;
  debugId?: string;
};

type DevToolsMessagingContextType = {
  detectedDebugIds: string[];

  currentInstanceLogs: DevToolsLogEntry[];
  currentInstance: DevToolsHostPageMessagePayload | null;

  activeDebugId: string | null;
  setActiveDebugId: (debugId: string | null) => void;

  sendMessageToHostPage: (type: string, payload: any) => void;
  sendMessageToBackgroundScript: (type: string, payload: any) => void;

  getLogs: (debugId?: string) => DevToolsLogEntry[];
  clearLogs: (debugId?: string) => void;
};
export const DevToolsMessagingContext =
  React.createContext<DevToolsMessagingContextType | null>(null);

export const useDevToolsMessagingContext = () => {
  const context = React.useContext(DevToolsMessagingContext);
  if (!context) {
    throw new Error(
      'useDevToolsMessagingContext must be used within a DevToolsMessagingContext',
    );
  }
  return context;
};

export const useLogs = (debugId?: string) => {
  const context = useDevToolsMessagingContext();

  const logsFromContext = context.getLogs(debugId);

  const logs = useMemo(() => {
    return logsFromContext.concat();
  }, [logsFromContext.length]);

  return {
    logs,
    clearLogs: context.clearLogs,
  };
};

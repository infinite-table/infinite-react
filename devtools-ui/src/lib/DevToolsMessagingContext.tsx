import * as React from 'react';
import type { DevToolsHostPageMessagePayload } from '@infinite-table/infinite-react';

type DevToolsMessagingContextType = {
  instances: Record<string, DevToolsHostPageMessagePayload>;
  setInstances: (
    instances: Record<string, DevToolsHostPageMessagePayload>,
  ) => void;
  currentInstance: DevToolsHostPageMessagePayload | null;

  activeDebugId: string | null;
  setActiveDebugId: (debugId: string | null) => void;

  sendMessageToContentScript: (type: string, payload: any) => void;
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

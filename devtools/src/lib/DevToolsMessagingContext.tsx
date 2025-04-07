import { createContext, useContext } from 'react';
import type { DevToolsHostPageMessagePayload } from '@infinite-table/infinite-react';

type DevToolsMessagingContextType = {
  instances: Record<string, DevToolsHostPageMessagePayload>;
  setInstances: (
    instances: Record<string, DevToolsHostPageMessagePayload>,
  ) => void;

  currentInstance: DevToolsHostPageMessagePayload | null;

  activeDebugId: string | null;
  setActiveDebugId: (debugId: string | null) => void;

  sendMessageToContentScript: <T>(type: string, payload: T) => void;
};

export const DevToolsMessagingContext =
  createContext<DevToolsMessagingContextType | null>(null);

export const useDevToolsMessagingContext = () => {
  const context = useContext(DevToolsMessagingContext);
  if (!context) {
    throw new Error(
      'useDevToolsMessagingContext must be used within a DevToolsMessagingContext',
    );
  }
  return context;
};

import { useCallback, useMemo, useState } from 'react';

import {
  DevToolsLogEntry,
  DevToolsMessagingContext,
  type PageData,
} from 'devtools-ui';

import {
  sendMessageToBackgroundScript,
  sendMessageToHostPage,
} from '../lib/messagingUtils';
import { useOnPageStorageChange } from '../hooks/useOnPageStorageChange';

function ChromeDevToolsProvider({ children }: { children: React.ReactNode }) {
  const [activeDebugId, setActiveDebugId] = useState<string | null>(null);

  const { pageData, clearLogs, getLogs } = useOnPageStorageChange<PageData>(
    chrome.storage.session,
  );
  const detectedDebugIds = Object.keys(pageData?.instances ?? []);

  const currentInstance = activeDebugId
    ? pageData?.instances[activeDebugId] ?? null
    : null;

  const currentInstanceLogs = useMemo<DevToolsLogEntry[]>(() => {
    return activeDebugId ? pageData?.logsPerInstance[activeDebugId] ?? [] : [];
  }, [pageData, activeDebugId]);

  return (
    <DevToolsMessagingContext
      value={{
        getLogs,
        clearLogs,
        detectedDebugIds,
        currentInstanceLogs,
        currentInstance,
        activeDebugId,
        setActiveDebugId,
        sendMessageToHostPage,
        sendMessageToBackgroundScript,
      }}
    >
      {children}
    </DevToolsMessagingContext>
  );
}

export default ChromeDevToolsProvider;

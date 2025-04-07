import { useState } from 'react';
import type { DevToolsHostPageMessagePayload } from '@infinite-table/infinite-react';

import { DevToolsMessagingContext } from 'devtools-ui';

import { sendMessageToContentScript } from '../lib/sendMessageToContentScript';
import { useOnStorageChange } from '../hooks/useOnStorageChange';

function ChromeDevToolsProvider({ children }: { children: React.ReactNode }) {
  const [instances, setInstances] = useState<
    Record<string, DevToolsHostPageMessagePayload>
  >({});

  const [activeDebugId, setActiveDebugId] = useState<string | null>(null);

  useOnStorageChange<typeof instances>(
    chrome.storage.session,
    'instances',
    (instances) => {
      setInstances(instances ?? {});
    },
  );
  const currentInstance = activeDebugId ? instances[activeDebugId] : null;

  return (
    <DevToolsMessagingContext
      value={{
        instances,
        setInstances,
        currentInstance,
        activeDebugId,
        setActiveDebugId,
        sendMessageToContentScript,
      }}
    >
      {children}
    </DevToolsMessagingContext>
  );
}

export default ChromeDevToolsProvider;

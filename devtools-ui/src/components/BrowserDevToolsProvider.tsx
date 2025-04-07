import { useCallback, useEffect, useState } from 'react';
import type { DevToolsHostPageMessagePayload } from '@infinite-table/infinite-react';
import { DevToolsMessagingContext } from '../lib/DevToolsMessagingContext';

function useInitDevTools() {
  useEffect(() => {
    function triggerInit() {
      if (!(window as any).__INFINITE_TABLE_DEVTOOLS_HOOK__) {
        window.postMessage({
          source: 'infinite-table-devtools-contentscript',
          target: 'infinite-table-page',
          type: 'register',
        });
      }

      setTimeout(() => {
        if (!(window as any).__INFINITE_TABLE_DEVTOOLS_HOOK__) {
          triggerInit();
        }
      }, 500);
    }

    triggerInit();
  }, []);
}

function useInfiniteInstances(
  setInstances: (
    instances: Record<string, DevToolsHostPageMessagePayload>,
  ) => void,
) {
  useInitDevTools();
  useEffect(() => {
    let lastPayloadsPerInstance: Record<
      string,
      DevToolsHostPageMessagePayload
    > = {};
    const listener = (event: MessageEvent) => {
      if (
        event.data.source === 'infinite-table-page' &&
        event.data.target === 'infinite-table-devtools-background'
      ) {
        const payload = event.data.payload as DevToolsHostPageMessagePayload;

        lastPayloadsPerInstance = {
          ...lastPayloadsPerInstance,
          [payload.debugId]: payload,
        };
        setInstances({ ...lastPayloadsPerInstance });
      }
    };

    window.addEventListener('message', listener);

    return () => {
      window.removeEventListener('message', listener);
    };
  }, [setInstances]);
}

function BrowserDevToolsProvider({ children }: { children: React.ReactNode }) {
  const [instances, setInstances] = useState<
    Record<string, DevToolsHostPageMessagePayload>
  >({});

  const [activeDebugId, setActiveDebugId] = useState<string | null>(null);

  useInfiniteInstances(setInstances);

  const currentInstance = activeDebugId ? instances[activeDebugId] : null;

  const sendMessageToContentScript = useCallback(
    (type: string, payload: DevToolsHostPageMessagePayload) => {
      window.postMessage({
        source: 'infinite-table-devtools-contentscript',
        target: 'infinite-table-page',
        type,
        payload,
      });
    },
    [],
  );

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

export default BrowserDevToolsProvider;

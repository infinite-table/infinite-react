import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DevToolsHostPageLogMessage,
  type DevToolsHostPageMessage,
  type DevToolsHostPageMessagePayload,
} from '@infinite-table/infinite-react';
import {
  DevToolsMessagingContext,
  type PageData,
  type DevToolsLogEntry,
} from '../lib/DevToolsMessagingContext';

import { IGNORE_DEBUG_IDS } from './ignoreDebugIds';

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

const getPageDataClone = (initialPageData: PageData | null) => {
  if (!initialPageData) {
    return {
      instances: {},
      logsPerInstance: {},
      allLogs: [],
    };
  }
  return {
    ...initialPageData,
    instances: { ...initialPageData.instances },
    logsPerInstance: { ...initialPageData.logsPerInstance },
  };
};

function usePageData() {
  const [pageData, setPageData] = useState<PageData | null>(() => {
    return getPageDataClone(null);
  });

  const pageDataRef = useRef<PageData | null>(null);
  pageDataRef.current = pageData;

  const getPageData = useCallback(() => {
    return pageDataRef.current;
  }, []);

  const clearLogs = useCallback(
    (debugId?: string) => {
      setPageData((pageData: PageData | null) => {
        const newPageData = getPageDataClone(pageData);
        if (!debugId) {
          newPageData.logsPerInstance = {};
          newPageData.allLogs = [];
        } else {
          delete newPageData.logsPerInstance[debugId];
          newPageData.allLogs = newPageData.allLogs.filter(
            (log) => log.debugId !== debugId,
          );
        }

        return newPageData;
      });
    },
    [pageData],
  );

  const getLogs = useCallback(
    (debugId?: string) => {
      return debugId
        ? pageData?.logsPerInstance[debugId] ?? []
        : pageData?.allLogs ?? [];
    },
    [pageData],
  );

  useInitDevTools();

  useEffect(() => {
    const setCurrentPageData = (pageData: PageData) => {
      setPageData(pageData);

      if (__DEV__) {
        (globalThis as any).__INFINITE_TABLE_DEVTOOLS_PAGE_DATA = pageData;
      }
    };

    const getCurrentPageData = () => {
      return getPageDataClone(getPageData());
    };

    const messageTypes = {
      log: (m: DevToolsHostPageMessage) => {
        const message = m as DevToolsHostPageLogMessage;
        const { channel } = message.payload;

        let debugId = undefined;
        if (channel.startsWith('DebugID=')) {
          debugId = channel.split(':')[0].slice('DebugID='.length);
        }

        const pageData = getCurrentPageData();
        const count = pageData.allLogs.length;

        const logEntry: DevToolsLogEntry = {
          ...message.payload,
          debugId,
          type: 'log',
          index: count,
          message: message.payload.args.join(' '),
        };

        if (
          !logEntry.debugId ||
          logEntry.debugId in IGNORE_DEBUG_IDS ||
          logEntry.debugId === 'undefined'
        ) {
          return;
        }

        pageData.logsPerInstance[logEntry.debugId] =
          pageData.logsPerInstance[logEntry.debugId] || [];
        pageData.logsPerInstance[logEntry.debugId].unshift(logEntry);

        pageData.allLogs.unshift(logEntry);

        setCurrentPageData(pageData);
      },
      unmount: (message: DevToolsHostPageMessage) => {
        if (message.type === 'unmount') {
          const { debugId } = message.payload;

          const newPageData = getCurrentPageData();
          delete newPageData.instances[debugId];
          delete newPageData.logsPerInstance[debugId];
          setCurrentPageData(newPageData);
        }
      },
      update: (message: DevToolsHostPageMessage) => {
        const payload = message.payload as DevToolsHostPageMessagePayload;
        const pageData = getCurrentPageData();

        pageData.instances[payload.debugId] = payload;
        pageData.logsPerInstance[payload.debugId] =
          pageData.logsPerInstance[payload.debugId] || [];

        setCurrentPageData(pageData);
      },
    };

    const listener = (event: MessageEvent) => {
      if (
        event.data.source === 'infinite-table-page' &&
        event.data.target === 'infinite-table-devtools-background'
      ) {
        const message = event.data as DevToolsHostPageMessage;

        if (
          message.payload.debugId &&
          message.payload.debugId in IGNORE_DEBUG_IDS
        ) {
          return;
        }
        const handler = messageTypes[message.type];

        if (handler) {
          handler(message);
        }
      }
    };

    window.addEventListener('message', listener);

    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);

  return {
    clearLogs,
    getLogs,
    pageData,
  };
}

function BrowserDevToolsProvider({ children }: { children: React.ReactNode }) {
  const [activeDebugId, setActiveDebugId] = useState<string | null>(null);

  const { clearLogs, getLogs, pageData } = usePageData();
  const detectedDebugIds = Object.keys(pageData?.instances ?? []);

  const currentInstance = activeDebugId
    ? pageData?.instances[activeDebugId] ?? null
    : null;

  const currentInstanceLogs = useMemo<DevToolsLogEntry[]>(() => {
    return activeDebugId ? pageData?.logsPerInstance[activeDebugId] ?? [] : [];
  }, [
    pageData?.logsPerInstance?.[activeDebugId || '']?.length ?? 0,
    activeDebugId,
  ]);

  const sendMessageToHostPage = useCallback(
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
  const sendMessageToBackgroundScript = useCallback(
    (type: string, payload: DevToolsHostPageMessagePayload) => {
      window.postMessage({
        source: 'infinite-table-devtools-contentscript',
        target: 'infinite-table-devtools-background',
        type,
        payload,
      });
    },
    [],
  );

  return (
    <DevToolsMessagingContext
      value={{
        detectedDebugIds,
        currentInstanceLogs,
        currentInstance,
        activeDebugId,
        setActiveDebugId,
        sendMessageToHostPage: sendMessageToHostPage,
        sendMessageToBackgroundScript,
        getLogs,
        clearLogs,
      }}
    >
      {children}
    </DevToolsMessagingContext>
  );
}

export default BrowserDevToolsProvider;

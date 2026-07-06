import { useCallback, useEffect, useState } from 'react';
import { getPageUrlOfInspectedTab } from '../lib/getCurrentPageUrl';
import { type PageData } from 'devtools-ui';

import { sendMessageToBackgroundScript } from '../lib/messagingUtils';

const getEmptyPageData = (): PageData => ({
  allLogs: [],
  logsPerInstance: {},
  instances: {},
});

export function useOnPageStorageChange<T>(
  storageArea: chrome.storage.SessionStorageArea,
) {
  const [pageData, doSetPageData] = useState<PageData | null>(null);
  const setPageData = useCallback(
    (pageData: PageData) => {
      doSetPageData({
        ...getEmptyPageData(),
        ...pageData,
      });
    },
    [doSetPageData],
  );

  const getLogs = useCallback(
    (debugId?: string) => {
      return debugId
        ? pageData?.logsPerInstance[debugId] ?? []
        : pageData?.allLogs ?? [];
    },
    [pageData],
  );

  const clearLogs = useCallback(
    async (debugId?: string) => {
      sendMessageToBackgroundScript('clearLogs', {
        debugId,
      });
    },
    [pageData],
  );

  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    const inspectedTabId = chrome.devtools?.inspectedWindow?.tabId;
    let cancelled = false;

    const syncPageUrl = async () => {
      const nextPageUrl = await getPageUrlOfInspectedTab();
      if (cancelled) {
        return;
      }
      setPageUrl((prev) => (prev === nextPageUrl ? prev : nextPageUrl));
    };

    void syncPageUrl();

    const onTabUpdated = (
      updatedTabId: number,
      info: chrome.tabs.TabChangeInfo,
    ) => {
      if (inspectedTabId != null && updatedTabId !== inspectedTabId) {
        return;
      }
      if (info.url != null || info.status === 'complete') {
        void syncPageUrl();
      }
    };
    chrome.tabs.onUpdated.addListener(onTabUpdated);

    const onNavigated = chrome.devtools?.network?.onNavigated;
    const navigatedListener = () => void syncPageUrl();
    onNavigated?.addListener(navigatedListener);

    return () => {
      cancelled = true;
      chrome.tabs.onUpdated.removeListener(onTabUpdated);
      onNavigated?.removeListener(navigatedListener);
    };
  }, []);

  useEffect(() => {
    if (!pageUrl) {
      return;
    }

    let listener: (changes: any) => void = () => {};

    async function init() {
      storageArea.get(pageUrl).then((result) => {
        const storageForPage = result[pageUrl];
        if (storageForPage) {
          setPageData(storageForPage);
        } else {
          setPageData(getEmptyPageData());
        }
      });

      listener = (changes: any) => {
        const storageForPage = changes[pageUrl];

        if (storageForPage) {
          setPageData(storageForPage.newValue);
        }
      };
      storageArea.onChanged.addListener(listener);
    }

    init();

    const runtimeListener = (message: { type?: string; pageUrl?: string }) => {
      if (message?.type === 'PAGE_DATA_UPDATED' && message.pageUrl === pageUrl) {
        storageArea.get(pageUrl).then((result) => {
          const storageForPage = result[pageUrl];
          if (storageForPage) {
            setPageData(storageForPage);
          }
        });
      }
    };
    chrome.runtime.onMessage.addListener(runtimeListener);

    return () => {
      storageArea.onChanged.removeListener(listener);
      chrome.runtime.onMessage.removeListener(runtimeListener);
    };
  }, [pageUrl, storageArea, setPageData]);

  return {
    clearLogs,
    getLogs,
    pageData,
  };
}

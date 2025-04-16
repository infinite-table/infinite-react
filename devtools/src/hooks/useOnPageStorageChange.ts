import { useCallback, useEffect, useState } from 'react';
import { getPageUrlOfCurrentTab } from '../lib/getCurrentPageUrl';
import { type PageData } from 'devtools-ui';

import {
  sendMessageToBackgroundScript,
  sendMessageToHostPage,
} from '../lib/messagingUtils';

export function useOnPageStorageChange<T>(
  storageArea: chrome.storage.SessionStorageArea,
) {
  const [pageData, setPageData] = useState<PageData | null>(null);

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

  useEffect(() => {
    let listener: (changes: any) => void = () => {};

    async function init() {
      const PAGE_URL = await getPageUrlOfCurrentTab();

      storageArea.get(PAGE_URL).then((result) => {
        const storageForPage = result[PAGE_URL];
        if (storageForPage) {
          setPageData(storageForPage);
        }
      });

      listener = (changes: any) => {
        const storageForPage = changes[PAGE_URL];

        if (storageForPage) {
          setPageData(storageForPage.newValue);
        }
      };
      storageArea.onChanged.addListener(listener);
    }

    init();

    return () => {
      storageArea.onChanged.removeListener(listener);
    };
  }, [storageArea]);

  return {
    clearLogs,
    getLogs,
    pageData,
  };
}

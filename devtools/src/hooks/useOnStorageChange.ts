import { useEffect, useRef } from 'react';
import { getPageUrlOfCurrentTab } from '../lib/getCurrentPageUrl';

type StorageChangeCallback<T> = (value: T) => void;

export function useOnStorageChange<T>(
  storageArea: chrome.storage.SessionStorageArea,
  key: string,
  callback: StorageChangeCallback<T>,
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    let listener: (changes: any) => void = () => {};

    async function init() {
      const PAGE_URL = await getPageUrlOfCurrentTab();

      storageArea.get(PAGE_URL).then((result) => {
        const storageForPage = result[PAGE_URL];
        if (storageForPage) {
          callbackRef.current?.(storageForPage[key]);
        }
      });

      listener = (changes: any) => {
        const storageForPage = changes[PAGE_URL];

        if (storageForPage) {
          callbackRef.current?.(storageForPage.newValue[key]);
        }
      };
      storageArea.onChanged.addListener(listener);
    }

    init();

    return () => {
      storageArea.onChanged.removeListener(listener);
    };
  }, [key, storageArea]);
}

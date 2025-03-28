const port = chrome.runtime.connect({ name: 'infinite-table-devtools' });

export function sendMessageToContentScript<T = any>(type: string, payload: T) {
  port.postMessage({
    source: 'infinite-table-devtools-contentscript-panel',
    target: 'infinite-table-page',
    type,
    payload,
  });
}

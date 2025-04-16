const port = chrome.runtime.connect({ name: 'infinite-table-devtools' });

export function sendMessageToHostPage<T = any>(type: string, payload: T) {
  port.postMessage({
    source: 'infinite-table-devtools-contentscript-panel',
    target: 'infinite-table-page',
    type,
    payload,
  });
}

export function sendMessageToBackgroundScript<T = any>(
  type: string,
  payload: T,
) {
  port.postMessage({
    source: 'infinite-table-devtools-contentscript-panel',
    target: 'infinite-table-devtools-background',
    type,
    payload,
  });
}

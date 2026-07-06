/** Consume Chrome's async lastError so it is not logged as "Unchecked runtime.lastError". */
function consumeLastError(): void {
  void chrome.runtime.lastError;
}

let port: chrome.runtime.Port | null = null;

function connectPort(): chrome.runtime.Port {
  if (port) {
    try {
      port.disconnect();
    } catch {
      // already closed
    }
  }

  const next = chrome.runtime.connect({ name: 'infinite-table-devtools' });
  next.onDisconnect.addListener(() => {
    port = null;
    consumeLastError();
  });
  port = next;
  return next;
}

function getPort(): chrome.runtime.Port {
  if (!port) {
    return connectPort();
  }
  return port;
}

function safePostMessage(message: object): void {
  try {
    getPort().postMessage(message);
  } catch {
    port = null;
    consumeLastError();
  }
}

function getInspectedTabId(): number | undefined {
  const tabId = chrome.devtools?.inspectedWindow?.tabId;
  return tabId == null ? undefined : tabId;
}

export function sendMessageToHostPage<T = any>(type: string, payload: T) {
  safePostMessage({
    source: 'infinite-table-devtools-contentscript-panel',
    target: 'infinite-table-page',
    type,
    payload,
    tabId: getInspectedTabId(),
  });
}

export function sendMessageToBackgroundScript<T = any>(
  type: string,
  payload: T,
) {
  safePostMessage({
    source: 'infinite-table-devtools-contentscript-panel',
    target: 'infinite-table-devtools-background',
    type,
    payload,
  });
}

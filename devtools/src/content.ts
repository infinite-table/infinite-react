import type {
  DevToolsGenericMessage,
  DevToolsMessageAddress,
} from '@infinite-table/infinite-react';

function getPageUrlOfWindow(): string {
  try {
    const parsed = new URL(window.location.href);
    return parsed.origin + parsed.pathname;
  } catch {
    return window.location.href;
  }
}

function getTopFramePageUrl(): string | null {
  try {
    if (window.top && window.top !== window) {
      const parsed = new URL(window.top.location.href);
      return parsed.origin + parsed.pathname;
    }
  } catch {
    // Cross-origin iframe: cannot read top.location from the page.
  }
  return null;
}

function consumeLastError(): void {
  void chrome.runtime.lastError;
}

function requestTabPageUrlFromBackground(): Promise<string> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        source: 'infinite-table-devtools-contentscript',
        target: 'infinite-table-devtools-background',
        type: 'get-tab-page-url',
      },
      (response: { pageUrl?: string } | undefined) => {
        if (chrome.runtime.lastError) {
          consumeLastError();
          resolve(getPageUrlOfWindow());
          return;
        }
        resolve(response?.pageUrl || getPageUrlOfWindow());
      },
    );
  });
}

/** Page URL key used for devtools storage (always the inspected tab, not an iframe path). */
function resolveStoragePageUrl(): Promise<string> {
  const topFrameUrl = getTopFramePageUrl();
  if (topFrameUrl) {
    return Promise.resolve(topFrameUrl);
  }
  if (window.top === window) {
    return Promise.resolve(getPageUrlOfWindow());
  }
  return requestTabPageUrlFromBackground();
}

type MessageForPage = DevToolsGenericMessage & {
  target: Extract<DevToolsMessageAddress, 'infinite-table-page'>;
  payload: any;
  type: string;
};

type MessageForBackground = DevToolsGenericMessage & {
  target: Extract<DevToolsMessageAddress, 'infinite-table-devtools-background'>;
  payload: any;
  type: string;
};

let port: chrome.runtime.Port | null = null;
/** True only when the extension itself is gone (reloaded/uninstalled) — not on service worker restarts. */
let extensionContextInvalidated = false;
const storagePageUrlPromise = resolveStoragePageUrl();

function isExtensionContextValid(): boolean {
  try {
    return Boolean(chrome.runtime?.id);
  } catch {
    return false;
  }
}

function markExtensionContextInvalidated(): void {
  extensionContextInvalidated = true;
  port = null;
  window.removeEventListener('message', onWindowMessage);
}

function connectPort(): chrome.runtime.Port | null {
  if (extensionContextInvalidated) {
    return null;
  }
  if (port) {
    try {
      port.disconnect();
    } catch {
      // already closed
    }
  }

  if (!isExtensionContextValid()) {
    markExtensionContextInvalidated();
    return null;
  }

  let next: chrome.runtime.Port;
  try {
    next = chrome.runtime.connect({ name: 'infinite-table-devtools' });
  } catch {
    markExtensionContextInvalidated();
    return null;
  }
  next.onDisconnect.addListener(() => {
    // The MV3 background service worker is routinely terminated after ~30s of
    // inactivity, which disconnects this port. Drop the port reference but keep
    // listening — the next message will reconnect (and wake the worker).
    if (port === next) {
      port = null;
    }
    consumeLastError();
    if (!isExtensionContextValid()) {
      markExtensionContextInvalidated();
    }
  });
  port = next;
  return next;
}

function getPort(): chrome.runtime.Port | null {
  return port ?? connectPort();
}

function postToBackground(message: object): void {
  if (extensionContextInvalidated) {
    return;
  }
  try {
    getPort()?.postMessage(message);
  } catch {
    // Port died between checks (e.g. worker terminated mid-flight): reconnect and retry once.
    port = null;
    consumeLastError();
    try {
      getPort()?.postMessage(message);
    } catch {
      port = null;
      consumeLastError();
    }
  }
}

const onWindowMessage = (event: MessageEvent) => {
  if (event.data.source === 'infinite-table-page' && !extensionContextInvalidated) {
    void storagePageUrlPromise.then((pageUrl) => {
      postToBackground({
        url: pageUrl,
        source: event.data.source,
        target: 'infinite-table-devtools-background',
        payload: event.data.payload,
        type: event.data.type,
      });
    });
  }
};

function onMessageForPage(message: MessageForPage) {
  window.postMessage(message);
}

function onMessageForBackground(message: MessageForBackground) {
  postToBackground(message);
}

function attachWindowMessageListener() {
  window.removeEventListener('message', onWindowMessage);
  window.addEventListener('message', onWindowMessage);
}

function restoreAfterBackForwardCache() {
  connectPort();
  attachWindowMessageListener();
  registerDevToolsHook();
}

connectPort();
attachWindowMessageListener();

// Only the top frame reload should clear instance data for the tab.
if (window.top === window) {
  void storagePageUrlPromise.then((pageUrl) => {
    postToBackground({
      source: 'infinite-table-devtools-contentscript',
      target: 'infinite-table-devtools-background',
      type: 'clear-page-instances',
      payload: { pageUrl },
    });
  });
}

window.addEventListener('pagehide', (event) => {
  if (event.persisted) {
    if (port) {
      try {
        port.disconnect();
      } catch {
        // already closed
      }
      port = null;
    }
    window.removeEventListener('message', onWindowMessage);
  }
});

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    restoreAfterBackForwardCache();
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.target === 'infinite-table-page') {
    onMessageForPage(message as MessageForPage);
  }
  if (message.target === 'infinite-table-devtools-background') {
    onMessageForBackground(message as MessageForBackground);
  }
});

const registerDevToolsHook = () => {
  window.postMessage({
    source: 'infinite-table-devtools-contentscript',
    target: 'infinite-table-page',
    type: 'register',
  });
};

registerDevToolsHook();

setInterval(() => {
  registerDevToolsHook();
}, 1000);

export {};

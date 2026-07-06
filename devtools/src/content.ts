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
let portDisconnected = false;
const storagePageUrlPromise = resolveStoragePageUrl();

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
    portDisconnected = true;
    port = null;
    consumeLastError();
    window.removeEventListener('message', onWindowMessage);
  });
  port = next;
  portDisconnected = false;
  return next;
}

function getPort(): chrome.runtime.Port {
  if (!port) {
    return connectPort();
  }
  return port;
}

function postToBackground(message: object): void {
  if (portDisconnected) {
    return;
  }
  try {
    getPort().postMessage(message);
  } catch {
    portDisconnected = true;
    port = null;
    consumeLastError();
  }
}

const onWindowMessage = (event: MessageEvent) => {
  if (event.data.source === 'infinite-table-page' && !portDisconnected) {
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
  portDisconnected = false;
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
    portDisconnected = true;
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

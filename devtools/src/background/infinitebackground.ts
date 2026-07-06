import type {
  DevToolsHostPageMessagePayload,
  DevToolsMessageAddress,
  DevToolsGenericMessage,
} from '@infinite-table/infinite-react';

import { type DevToolsLogEntry, IGNORE_DEBUG_IDS } from 'devtools-ui';

import { dataUtils } from './dataUtils';
import { getPageUrlOfInspectedTab, normalizePageUrl } from '../lib/getCurrentPageUrl';

type MessageFromPageToBackground = {
  source: Extract<DevToolsMessageAddress, 'infinite-table-page'>;
  target: Extract<DevToolsMessageAddress, 'infinite-table-devtools-background'>;
  payload: any;
  url: string;
  type: string;
};

type MessageForPage = DevToolsGenericMessage & {
  target: Extract<DevToolsMessageAddress, 'infinite-table-page'>;
  payload: any;
  type: string;
  tabId?: number;
};

function consumeLastError(): void {
  void chrome.runtime.lastError;
}

function broadcastPageDataUpdated(pageUrl: string) {
  const normalized = normalizePageUrl(pageUrl);
  void chrome.runtime
    .sendMessage({
      type: 'PAGE_DATA_UPDATED',
      pageUrl: normalized,
    })
    .catch(() => {
      // No devtools panel listening
    });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Infinite Table DevTools Extension installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (
    message?.source === 'infinite-table-devtools-contentscript' &&
    message?.target === 'infinite-table-devtools-background' &&
    message?.type === 'get-tab-page-url'
  ) {
    const tabUrl = sender.tab?.url ?? '';
    sendResponse({ pageUrl: tabUrl ? normalizePageUrl(tabUrl) : '' });
    return true;
  }
  return false;
});

// Example: Listen for connections from the DevTools page
chrome.runtime.onConnect.addListener((port) => {
  console.log('Devtools port connected', port);

  if (port.name === 'infinite-table-devtools') {
    port.onMessage.addListener((message: DevToolsGenericMessage) => {
      messageRouter(message);
    });
    port.onDisconnect.addListener(() => {
      consumeLastError();
    });
  }
});

function messageRouter(message: DevToolsGenericMessage) {
  if (
    message.source === 'infinite-table-devtools-contentscript' &&
    message.target === 'infinite-table-devtools-background' &&
    message.type === 'clear-page-instances'
  ) {
    const { pageUrl } = message.payload as { pageUrl: string };
    if (pageUrl) {
      void dataUtils.clearPageInstances(pageUrl).then(() => {
        broadcastPageDataUpdated(pageUrl);
      });
    }
    return;
  }
  if (
    message.source === 'infinite-table-page' &&
    message.target === 'infinite-table-devtools-background'
  ) {
    onMessageFromPage(message as MessageFromPageToBackground);
  }
  if (message.target === 'infinite-table-page') {
    void onMessageForPage(message as MessageForPage);
  }
  if (
    message.source === 'infinite-table-devtools-contentscript-panel' &&
    message.target === 'infinite-table-devtools-background'
  ) {
    onMessageFromPanel(message);
  }
}

function onMessageFromPanel(message: DevToolsGenericMessage) {
  const messageTypes = {
    clearLogs: async (message: DevToolsGenericMessage) => {
      const { debugId } = message.payload;

      await dataUtils.logs.clear(debugId);
      const pageUrl = await getPageUrlOfInspectedTab();
      if (pageUrl) {
        broadcastPageDataUpdated(pageUrl);
      }
    },
  };

  const messageType = message.type as keyof typeof messageTypes;

  const handler = messageTypes[messageType];

  if (handler) {
    handler(message);
  }
}

async function onMessageForPage(message: MessageForPage) {
  let tabId = message.tabId;
  if (tabId == null) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    tabId = tabs[0]?.id;
  }
  if (tabId == null) {
    return;
  }

  try {
    const frames = await chrome.webNavigation.getAllFrames({ tabId });
    const frameIds =
      frames && frames.length > 0
        ? frames.map((frame) => frame.frameId)
        : [0];

    await Promise.all(
      frameIds.map((frameId) =>
        chrome.tabs
          .sendMessage(tabId, message, { frameId })
          .catch(() => undefined),
      ),
    );
  } catch {
    await chrome.tabs.sendMessage(tabId, message).catch(() => undefined);
  }
}

async function onMessageFromPage(message: MessageFromPageToBackground) {
  const { url } = message;
  const count = dataUtils.logs.getCount(url);

  const messageTypes = {
    log: async (message: MessageFromPageToBackground) => {
      const { channel } = message.payload;

      let debugId = undefined;
      if (channel.startsWith('DebugID=')) {
        debugId = channel.split(':')[0].slice('DebugID='.length);
      }

      const logEntry: DevToolsLogEntry = {
        ...message.payload,
        debugId,
        index: count,
        type: 'log',

        message: message.payload.args.join(' '),
      };

      if (
        !logEntry.debugId ||
        logEntry.debugId in IGNORE_DEBUG_IDS ||
        logEntry.debugId === 'undefined'
      ) {
        return;
      }

      await dataUtils.logs.addLog({ url }, logEntry);
      broadcastPageDataUpdated(url);
    },
    unmount: async (message: MessageFromPageToBackground) => {
      const { debugId } = message.payload;

      await dataUtils.instance.remove({ debugId, url });
      broadcastPageDataUpdated(url);
    },
    update: async (message: MessageFromPageToBackground) => {
      const debugId: string = message.payload.debugId;

      await dataUtils.instance.update(
        { debugId, url },
        message.payload as DevToolsHostPageMessagePayload,
      );
      broadcastPageDataUpdated(url);
    },
  };

  if (
    message.target === 'infinite-table-devtools-background' &&
    message.source === 'infinite-table-page'
  ) {
    const messageType = message.type as keyof typeof messageTypes;

    const handler = messageTypes[messageType];

    if (handler) {
      await handler(message);
    }
  }
}

// "content_scripts": [
// {
//   "matches": ["http://localhost/*", "https://infinite-table.com/*"],
//   "js": ["./src/content.ts"]
// }
// ],

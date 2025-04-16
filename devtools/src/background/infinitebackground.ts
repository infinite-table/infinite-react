import type {
  DevToolsHostPageMessagePayload,
  DevToolsMessageAddress,
  DevToolsGenericMessage,
} from '@infinite-table/infinite-react';

import { type DevToolsLogEntry, IGNORE_DEBUG_IDS } from 'devtools-ui';

import { dataUtils } from './dataUtils';

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
};

chrome.runtime.onInstalled.addListener(() => {
  console.log('Infinite Table DevTools Extension installed');
});

// Example: Listen for connections from the DevTools page
chrome.runtime.onConnect.addListener((port) => {
  console.log('Devtools port connected', port);

  if (port.name === 'infinite-table-devtools') {
    port.onMessage.addListener((message: DevToolsGenericMessage) => {
      messageRouter(message);
    });
  }
});

function messageRouter(message: DevToolsGenericMessage) {
  if (
    message.source === 'infinite-table-page' &&
    message.target === 'infinite-table-devtools-background'
  ) {
    onMessageFromPage(message as MessageFromPageToBackground);
  }
  if (message.target === 'infinite-table-page') {
    onMessageForPage(message as MessageForPage);
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

      dataUtils.logs.clear(debugId);
    },
  };

  const messageType = message.type as keyof typeof messageTypes;

  const handler = messageTypes[messageType];

  if (handler) {
    handler(message);
  }
}

function onMessageForPage(message: MessageForPage) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0]!.id!;
    // Send a message to the content script in the active tab
    chrome.tabs.sendMessage(tabId, message);
  });
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

      dataUtils.logs.addLog({ url }, logEntry);
    },
    unmount: async (message: MessageFromPageToBackground) => {
      const { debugId } = message.payload;

      dataUtils.instance.remove({ debugId, url });
    },
    update: async (message: MessageFromPageToBackground) => {
      const debugId: string = message.payload.debugId;

      dataUtils.instance.update(
        { debugId, url },
        message.payload as DevToolsHostPageMessagePayload,
      );
    },
  };

  if (
    message.target === 'infinite-table-devtools-background' &&
    message.source === 'infinite-table-page'
  ) {
    const messageType = message.type as keyof typeof messageTypes;

    const handler = messageTypes[messageType];

    if (handler) {
      handler(message);
    }
  }
}

// "content_scripts": [
// {
//   "matches": ["http://localhost/*", "https://infinite-table.com/*"],
//   "js": ["./src/content.ts"]
// }
// ],

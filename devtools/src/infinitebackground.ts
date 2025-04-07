import type {
  DevToolsHostPageMessagePayload,
  DevToolsMessageAddress,
  DevToolsGenericMessage,
} from '@infinite-table/infinite-react';
import { getPageUrlOfCurrentTab } from './lib/getCurrentPageUrl';

type MessageFromPageToBackground = {
  source: Extract<DevToolsMessageAddress, 'infinite-table-page'>;
  target: Extract<DevToolsMessageAddress, 'infinite-table-devtools-background'>;
  payload: any;
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

// chrome.scripting
//   .updateContentScripts([
//     {
//       id: 'infinite-content-script',
//       js: ['src/content.js'],
//       // persistAcrossSessions: false,
//       matches: ['http://localhost/*', 'https://infinite-table.com/*'],
//       runAt: 'document_start',
//     },
//   ])
//   .then(() => console.log('registration complete!!'))
//   .catch((err) => console.warn('unexpected error', err));

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
}

function onMessageForPage(message: MessageForPage) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0]!.id!;
    // Send a message to the content script in the active tab
    chrome.tabs.sendMessage(tabId, message);
  });
}
const payloadsForPages: Record<
  string,
  Record<string, DevToolsHostPageMessagePayload>
> = {};

async function onMessageFromPage(message: MessageFromPageToBackground) {
  const messageTypes = {
    unmount: async (message: MessageFromPageToBackground) => {
      const pageUrl = await getPageUrlOfCurrentTab();
      const payloadsForCurrentPage = payloadsForPages[pageUrl] || {};

      if (payloadsForCurrentPage && payloadsForCurrentPage.instances) {
        // @ts-ignore
        delete payloadsForCurrentPage.instances[message.payload.debugId];

        chrome.storage.session.set(payloadsForPages);
      }
    },
    update: async (message: MessageFromPageToBackground) => {
      const pageUrl = await getPageUrlOfCurrentTab();

      payloadsForPages[pageUrl] = payloadsForPages[pageUrl] || {
        instances: {},
      };

      const payloadForCurrentPage = payloadsForPages[pageUrl];

      // @ts-ignore
      payloadForCurrentPage.instances[message.payload.debugId] =
        message.payload as DevToolsHostPageMessagePayload;

      chrome.storage.session.set(payloadsForPages);
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

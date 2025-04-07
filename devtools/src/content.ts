import type {
  DevToolsGenericMessage,
  DevToolsMessageAddress,
} from '@infinite-table/infinite-react';

type MessageForPage = DevToolsGenericMessage & {
  target: Extract<DevToolsMessageAddress, 'infinite-table-page'>;
  payload: any;
  type: string;
};

const port = chrome.runtime.connect({ name: 'infinite-table-devtools' });

window.addEventListener('message', (event) => {
  if (event.data.source === 'infinite-table-page') {
    // all messages from the page
    // will be forwarded to the background script
    port.postMessage({
      source: event.data.source,
      target: 'infinite-table-devtools-background',
      payload: event.data.payload,
      type: event.data.type,
    });
  }
});

function onMessageForPage(message: MessageForPage) {
  console.log('got message for page', message);
  window.postMessage(message);
}

// listen for messages from devtools panels
chrome.runtime.onMessage.addListener((message) => {
  if (message.target === 'infinite-table-page') {
    onMessageForPage(message as MessageForPage);
  }
});

// post message to trigger page to register the __INFINITE_TABLE_DEVTOOLS_HOOK__ fn
window.postMessage({
  source: 'infinite-table-devtools-contentscript',
  target: 'infinite-table-page',
  type: 'register',
});

export {};

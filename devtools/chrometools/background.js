chrome.runtime.onInstalled.addListener(() => {
  console.log('DevTools Extension installed');
});

// Example: Listen for connections from the DevTools page
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'devtools-page') {
    port.onMessage.addListener((message) => {
      // Handle messages from the DevTools page
      console.log('Received message from DevTools page:', message);
    });
  }
});

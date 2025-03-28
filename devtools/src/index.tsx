chrome.devtools.panels.create(
  'Infinite-Table',
  'icons/icon16.png',
  'src/panel.html',
  (panel) => {
    console.log('DevTools panel created!!!!!!!!!!');

    chrome.runtime.onInstalled.addListener(() => {
      console.log('Infinite Table DevTools Extension installed');
    });
  },
);

let title = 'Infinite Table';
if (__DEV__) {
  title = 'Infinite Table DEV';
}
chrome.devtools.panels.create(
  title,
  'icons/icon16.png',
  'src/panel.html',
  (panel) => {
    console.log('DevTools panel created!!!!!!!!!!');

    chrome.runtime.onInstalled.addListener(() => {
      console.log('Infinite Table DevTools Extension installed');
    });
  },
);

export async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

export async function getPageUrlOfCurrentTab() {
  const tab = await getCurrentTab();
  const url = new URL(tab?.url!);
  return url.origin + url.pathname;
}

export function getPageUrlOfWindow() {
  const url = new URL(window.location.href);
  return url.origin + url.pathname;
}

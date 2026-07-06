export async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

export function normalizePageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.origin + parsed.pathname;
  } catch {
    return url;
  }
}

export async function getPageUrlOfCurrentTab() {
  const tab = await getCurrentTab();
  if (!tab?.url) {
    return '';
  }
  return normalizePageUrl(tab.url);
}

/** Page URL for the tab inspected by the DevTools panel (not the DevTools window itself). */
export async function getPageUrlOfInspectedTab(): Promise<string> {
  const inspectedTabId = chrome.devtools?.inspectedWindow?.tabId;
  if (inspectedTabId != null) {
    try {
      const tab = await chrome.tabs.get(inspectedTabId);
      if (tab.url) {
        return normalizePageUrl(tab.url);
      }
    } catch {
      // fall through
    }
  }
  return getPageUrlOfCurrentTab();
}

export function getPageUrlOfWindow() {
  return normalizePageUrl(window.location.href);
}

import type { DevToolsHostPageMessagePayload } from '@infinite-table/infinite-react';

import { type DevToolsLogEntry, type PageData } from 'devtools-ui';
import { getPageUrlOfCurrentTab } from '../lib/getCurrentPageUrl';

const DATABASE: Record<string, PageData> = {
  // 'http://localhost:3000': {
  //   instances: {},
  //   logsPerInstance: {},
  //   allLogs: [],
  // },
};

function updatePageData(pageUrl: string, pageData: Partial<PageData>) {
  const dataForPage = DATABASE[pageUrl] || {};

  DATABASE[pageUrl] = {
    ...dataForPage,
    ...pageData,
  };

  return chrome.storage.session.set(DATABASE);
}

async function setInstanceData(
  pageUrl: string,
  debugId: string,
  instanceData: DevToolsHostPageMessagePayload,
) {
  const pageData = getPageData(pageUrl);
  const instances = pageData.instances || {};
  await updatePageData(pageUrl, {
    instances: { ...instances, [debugId]: instanceData },
  });
}

function getInstancesForPage(pageUrl: string): PageData['instances'] {
  const data = getPageData(pageUrl);
  return data.instances || {};
}

function getInstanceDataForPage(
  pageUrl: string,
  debugId: string,
): DevToolsHostPageMessagePayload | null {
  const data = getPageData(pageUrl);
  return data.instances[debugId] || null;
}

function removeInstanceDataForCurrentPage(pageUrl: string, debugId: string) {
  const pageData = getPageData(pageUrl);

  if (!pageData) {
    return;
  }

  if (pageData.instances) {
    delete pageData.instances[debugId];
  }

  if (pageData.logsPerInstance) {
    delete pageData.logsPerInstance[debugId];
  }

  if (pageData.allLogs) {
    pageData.allLogs = pageData.allLogs.filter(
      (log) => log.debugId !== debugId,
    );
  }

  return updatePageData(pageUrl, pageData);
}

function getPageData(pageUrl: string): PageData {
  const pageData = DATABASE[pageUrl] || {
    instances: {},
    logsPerInstance: {},
    allLogs: [],
  };

  return pageData;
}

function clearLogs(pageUrl: string, debugId?: string) {
  const pageData = getPageData(pageUrl);
  if (!debugId) {
    pageData.logsPerInstance = {};
    pageData.allLogs = [];
  } else {
    pageData.logsPerInstance[debugId] = [];
    pageData.allLogs = pageData.allLogs.filter(
      (log) => log.debugId !== debugId,
    );
  }
  return updatePageData(pageUrl, pageData);
}

function addLog(options: { url: string }, log: DevToolsLogEntry) {
  const { url } = options;
  const pageData = getPageData(url);

  if (log.debugId) {
    pageData.logsPerInstance = pageData.logsPerInstance || {};
    pageData.logsPerInstance[log.debugId] =
      pageData.logsPerInstance[log.debugId] || [];
    pageData.logsPerInstance[log.debugId].unshift(log);
  }
  pageData.allLogs = pageData.allLogs || [];
  pageData.allLogs.unshift(log);

  return updatePageData(url, pageData);
}

const forPage = (url: string) => {
  return {
    logs: {
      addLog: (log: DevToolsLogEntry) => addLog({ url }, log),
      getCount: () => {
        const pageData = getPageData(url);
        return pageData.allLogs?.length ?? 0;
      },
      clear: (debugId?: string) => clearLogs(url, debugId),
    },
    instance: {
      getById: (debugId: string) => getInstanceDataForPage(url, debugId),
      setById: (
        debugId: string,
        instanceData: DevToolsHostPageMessagePayload,
      ) => setInstanceData(url, debugId, instanceData),
      removeById: (debugId: string) =>
        removeInstanceDataForCurrentPage(url, debugId),
      getAll: () => getInstancesForPage(url),
    },
  };
};

export type InstanceOptions = {
  debugId: string;
  url: string;
};
export const dataUtils = {
  forPage,

  logs: {
    clear: async (debugId?: string) => {
      const pageUrl = await getPageUrlOfCurrentTab();
      return clearLogs(pageUrl, debugId);
    },
    addLog,
    getCount: (url: string) => {
      const pageData = getPageData(url);
      return pageData.allLogs?.length ?? 0;
    },
  },
  instance: {
    update: async (
      options: InstanceOptions,

      instanceData: DevToolsHostPageMessagePayload,
    ) => {
      const { debugId, url } = options;
      return setInstanceData(url, debugId, instanceData);
    },
    remove: async (options: InstanceOptions) => {
      const { debugId, url } = options;
      return removeInstanceDataForCurrentPage(url, debugId);
    },
  },
};

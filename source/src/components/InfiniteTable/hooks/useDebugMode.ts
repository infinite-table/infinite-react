import { useEffect, useRef } from 'react';
import { once } from '../../../utils/DeepMap/once';
import type { DebugTimingKey } from '../../DataSource';

import { debug } from '../../../utils/debugPackage';
import { stripVar } from '../../../utils/stripVar';

import { CSS_LOADED_VALUE, ThemeVars } from '../vars.css';
import { useInfiniteTable } from './useInfiniteTable';
import {
  DataSourceDebugWarningKey,
  ErrorCodeKey,
  DebugWarningPayload,
  DevToolsDataSourceOverrides,
  DevToolsHookFn,
  DevToolsHookFnOptions,
  DevToolsHostPageMessage,
  DevToolsInfiniteOverrides,
  InfiniteTableDebugWarningKey,
} from '../types/DevTools';

import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';
import {
  InfiniteTablePropColumnVisibility,
  InfiniteTablePropGroupRenderStrategy,
} from '../types/InfiniteTableProps';
import {
  DEV_TOOLS_INFINITE_OVERRIDES,
  DEV_TOOLS_DATASOURCE_OVERRIDES,
  DEV_TOOLS_INFINITE_INITIALS,
  DEV_TOOLS_DATASOURCE_INITIALS,
} from '../../../DEV_TOOLS_OVERRIDES';

import {
  deleteInstanceFromDevTools,
  INSTANCES,
  logDevToolsWarning,
  setDevToolDataSourcePropertyOverride,
  setDevToolInfinitePropertyOverride,
  updateDevToolsForInstance,
} from '../../../utils/debugModeUtils';
import {
  DevToolsOverlay,
  DevToolsOverlayBg,
  DevToolsOverlayText,
} from './debugModeDevToolsOverlay.css';

const cssFileLoadedVarName = stripVar(ThemeVars.loaded);
const messageBase = {
  source: 'infinite-table-page',
  target: 'infinite-table-devtools-background',
} as const;

function buildMessageForExtension(
  params: {
    type: Exclude<DevToolsHostPageMessage['type'], 'log'>;
    debugId: string;
  },
  options: DevToolsHookFnOptions | null,
): DevToolsHostPageMessage {
  const { type, debugId } = params;

  if (type === 'unmount') {
    return {
      ...messageBase,
      url: getPageUrlOfWindow(),
      type,
      payload: {
        debugId,
      },
    };
  }

  const opts = options!;
  const computedValues = opts.getComputed();
  const dataSourceState = opts.getDataSourceState();
  const state = opts.getState();

  const message: DevToolsHostPageMessage = {
    ...messageBase,
    url: getPageUrlOfWindow(),
    type,
    payload: {
      debugId,
      columnVisibility: state.columnVisibility,
      columnOrder: computedValues.computedColumnOrder,
      visibleColumnIds: computedValues.computedVisibleColumns.map((c) => c.id),
      selectionMode: dataSourceState.selectionMode,
      columns: Object.fromEntries(
        computedValues.computedVisibleColumns.map((c) => [
          c.id,
          {
            field: c.field,
            dataType: c.computedDataType,
            sortType: c.computedSortType,
            filtered: c.computedFiltered,
            sorted: c.computedSorted,
            width: c.computedWidth,
          },
        ]),
      ),
      groupRenderStrategy: state.groupRenderStrategy,
      groupBy: dataSourceState.groupBy.map((g) =>
        g.field ? `${g.field}` : '<fn>',
      ),
      sortInfo: (dataSourceState.sortInfo || [])
        .filter((sortInfo) => typeof sortInfo.field === 'string')
        .map((s) => {
          return {
            field: `${s.field as string}`,
            dir: s.dir,
            type: Array.isArray(s.type) ? s.type[0] : s.type ?? 'string',
          };
        }),
      multiSort: dataSourceState.multiSort,
      devToolsDetected: state.devToolsDetected,
      debugTimings: Object.fromEntries(dataSourceState.debugTimings) as Record<
        DebugTimingKey,
        number
      >,
      debugWarnings: {
        ...(Object.fromEntries(dataSourceState.debugWarnings) as Record<
          ErrorCodeKey,
          DebugWarningPayload
        >),
        ...(Object.fromEntries(state.debugWarnings) as Record<
          ErrorCodeKey,
          DebugWarningPayload
        >),
      },
    },
  };

  return message;
}
const getPageUrlOfWindow = once(function () {
  const url = new URL(window.location.href);
  return url.origin + url.pathname;
});

function postMessage(message: DevToolsHostPageMessage) {
  window.postMessage(message);
}

const setupHook = once<any, DevToolsHookFn>(() => {
  console.log('Infinite Table DevTools detected!');

  const hookFn: DevToolsHookFn = (
    debugId: string,
    options: null | DevToolsHookFnOptions,
  ) => {
    if (options) {
      INSTANCES.set(debugId, options);
      const { devToolsDetected } = options.getState();

      if (!devToolsDetected) {
        options.actions.devToolsDetected = true;
      }
      const dataSourceState = options.getDataSourceState();
      if (dataSourceState.debugId !== debugId) {
        options.dataSourceActions.debugId = debugId;
      }
      if (!dataSourceState.devToolsDetected) {
        options.dataSourceActions.devToolsDetected = true;
      }

      window.postMessage(
        buildMessageForExtension({ type: 'update', debugId }, options),
      );
    } else {
      deleteInstanceFromDevTools(debugId);
      window.postMessage(
        buildMessageForExtension({ type: 'unmount', debugId }, null),
      );
    }
  };

  (window as any).__INFINITE_TABLE_DEVTOOLS_HOOK__ = hookFn;

  debug.onLogIntent('*', (options) => {
    postMessage({
      ...messageBase,
      url: getPageUrlOfWindow(),
      type: 'log',
      payload: {
        debugId: undefined,
        channel: options.channel,
        color: options.color,
        args: options.args.map((arg) => {
          if (typeof arg === 'object' && arg !== null) {
            return JSON.stringify(arg);
          }
          return String(arg);
        }),
        timestamp: options.timestamp,
      },
    });
  });

  return hookFn;
});

export function useDebugMode() {
  const { getState, getDataSourceState, dataSourceActions } =
    useInfiniteTable();

  const state = getState();
  const { domRef, debugId } = state;

  if (debugId) {
    if (domRef.current) {
      const value = getComputedStyle(domRef.current).getPropertyValue(
        cssFileLoadedVarName,
      );

      if (value !== `${CSS_LOADED_VALUE}`) {
        logDevToolsWarning({
          debugId,
          key: 'CSS001_CSS',
        });
      }
    }
  }

  useEffect(() => {
    const dataSourceState = getDataSourceState();
    if (dataSourceState.debugId !== debugId) {
      dataSourceActions.debugId = debugId;
    }
  }, [debugId]);

  return useDevTools();
}

const HOOK_FN_SETUP_CALLBACK = buildSubscriptionCallback<DevToolsHookFn>();

const DEVTOOLS_MESSAGES = {
  revertAll: (payload: { debugId: string }) => {
    const instance = INSTANCES.get(payload.debugId);
    if (instance) {
      const infiniteInitials = DEV_TOOLS_INFINITE_INITIALS.get(payload.debugId);

      DEV_TOOLS_INFINITE_INITIALS.delete(payload.debugId);
      DEV_TOOLS_INFINITE_OVERRIDES.delete(payload.debugId);

      if (infiniteInitials) {
        Object.keys(infiniteInitials).forEach((key) => {
          //@ts-ignore
          instance.actions[key] = infiniteInitials[key];
          //@ts-ignore
          delete infiniteInitials[key];
        });
      }

      const dataSourceInitials = DEV_TOOLS_DATASOURCE_INITIALS.get(
        payload.debugId,
      );

      DEV_TOOLS_DATASOURCE_INITIALS.delete(payload.debugId);
      DEV_TOOLS_DATASOURCE_OVERRIDES.delete(payload.debugId);
      if (dataSourceInitials) {
        Object.keys(dataSourceInitials).forEach((key) => {
          //@ts-ignore
          instance.dataSourceActions[key] = dataSourceInitials[key];
          //@ts-ignore
          delete dataSourceInitials[key];
        });
      }
    }
  },
  revertProperty: (payload: {
    property:
      | keyof DevToolsDataSourceOverrides
      | keyof DevToolsInfiniteOverrides;
    debugId: string;
  }) => {
    const instance = INSTANCES.get(payload.debugId);
    if (instance) {
      const property = payload.property;
      const infiniteOverrides = DEV_TOOLS_INFINITE_OVERRIDES.get(
        payload.debugId,
      );
      const infiniteInitials = DEV_TOOLS_INFINITE_INITIALS.get(payload.debugId);
      const dataSourceOverrides = DEV_TOOLS_DATASOURCE_OVERRIDES.get(
        payload.debugId,
      );
      const dataSourceInitials = DEV_TOOLS_DATASOURCE_INITIALS.get(
        payload.debugId,
      );

      const infiniteStateProp = property as keyof DevToolsInfiniteOverrides;
      if (
        infiniteInitials &&
        infiniteOverrides &&
        infiniteOverrides[infiniteStateProp] !== undefined
      ) {
        delete infiniteOverrides[infiniteStateProp];
        // @ts-ignore
        instance.actions[infiniteStateProp] =
          infiniteInitials[infiniteStateProp];

        delete infiniteInitials[infiniteStateProp];
      }

      const dataSourceStateProp = property as keyof DevToolsDataSourceOverrides;
      if (
        dataSourceInitials &&
        dataSourceOverrides &&
        dataSourceOverrides[dataSourceStateProp] !== undefined
      ) {
        const dataSourceInitials =
          DEV_TOOLS_DATASOURCE_INITIALS.get(payload.debugId) || {};

        delete dataSourceOverrides[dataSourceStateProp];

        // @ts-ignore
        instance.dataSourceActions[dataSourceStateProp] =
          dataSourceInitials[dataSourceStateProp];

        delete dataSourceInitials[dataSourceStateProp];
      }
    }
  },

  discardWarning: (payload: { warning: ErrorCodeKey; debugId: string }) => {
    const instance = INSTANCES.get(payload.debugId);

    if (instance) {
      const dsWarningKey = payload.warning as DataSourceDebugWarningKey;

      const dsWarnings = instance.getDataSourceState().debugWarnings;
      const obj = dsWarnings.get(dsWarningKey);

      if (obj) {
        // obj.status = 'discarded';
        dsWarnings.delete(dsWarningKey);
        updateDevToolsForInstance(payload.debugId);
      } else {
        const itWarningKey = payload.warning as InfiniteTableDebugWarningKey;
        const infiniteWarnings = instance.getState().debugWarnings;
        const obj = infiniteWarnings.get(itWarningKey);
        if (obj) {
          // obj.status = 'discarded';
          infiniteWarnings.delete(itWarningKey);
          updateDevToolsForInstance(payload.debugId);
        }
      }
    }
  },
  discardAllWarnings: (payload: { debugId: string }) => {
    const instance = INSTANCES.get(payload.debugId);
    if (instance) {
      instance.getDataSourceState().debugWarnings.clear();
      instance.getState().debugWarnings.clear();
      updateDevToolsForInstance(payload.debugId);
    }
  },
  setColumnVisibility: (payload: {
    columnVisibility: InfiniteTablePropColumnVisibility;
    debugId: string;
  }) => {
    setDevToolInfinitePropertyOverride(
      payload.debugId,
      'columnVisibility',
      payload.columnVisibility,
    );
  },
  setGroupBy: (payload: { groupBy: { field: string }[]; debugId: string }) => {
    setDevToolDataSourcePropertyOverride(
      payload.debugId,
      'groupBy',
      payload.groupBy,
    );
  },
  setGroupRenderStrategy: (payload: {
    groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
    debugId: string;
  }) => {
    setDevToolInfinitePropertyOverride(
      payload.debugId,
      'groupRenderStrategy',
      payload.groupRenderStrategy,
    );
  },
  setSortInfo: (payload: {
    sortInfo: { field: string; dir: 1 | -1 }[];
    debugId: string;
  }) => {
    setDevToolDataSourcePropertyOverride(
      payload.debugId,
      'sortInfo',
      payload.sortInfo,
    );
  },
  setMultiSort: (payload: { multiSort: boolean; debugId: string }) => {
    setDevToolDataSourcePropertyOverride(
      payload.debugId,
      'multiSort',
      payload.multiSort,
    );
  },
  highlight: (payload: { debugId: string }) => {
    const instance = INSTANCES.get(payload.debugId);
    if (instance) {
      const domNode = instance.getState().domRef.current;

      if (domNode) {
        const rect = domNode.getBoundingClientRect();

        let overlay = document.querySelector(
          `.${DevToolsOverlay.classNames.base}`,
        ) as HTMLElement;

        if (!overlay) {
          overlay = document.createElement('div');
          overlay.classList.add(DevToolsOverlay.classNames.base);

          overlay.innerHTML = [
            `<div class="${DevToolsOverlayText}"></div>`,
            `<div class="${DevToolsOverlayBg}"></div>`,
          ].join('');
          document.body.appendChild(overlay);
        }
        let textDiv = overlay.firstElementChild!;

        if (overlay) {
          // First set the position and size
          overlay.style.left = `${rect.left}px`;
          overlay.style.top = `${rect.top}px`;
          overlay.style.width = `${rect.width}px`;
          overlay.style.height = `${rect.height}px`;

          textDiv.innerHTML = payload.debugId;

          const overlayBg = overlay.lastElementChild as HTMLElement;

          // Force a reflow to ensure the initial styles are applied
          // overlay.offsetHeight;

          // Remove the active class after the animation ends
          const handleAnimationEnd = () => {
            overlay.classList.remove(
              DevToolsOverlay.classNames.variants.active.true,
            );
            // Remove the listener
            overlayBg.removeEventListener('animationend', handleAnimationEnd);
          };

          overlayBg.addEventListener('animationend', handleAnimationEnd);

          // Add the active class to trigger the show animation
          overlay.classList.add(
            DevToolsOverlay.classNames.variants.active.true,
          );
        }
      }
    }
  },
};

function listenForDevTools() {
  if (typeof window !== 'undefined') {
    window.addEventListener('message', (event) => {
      if (
        event.data.source.startsWith('infinite-table-devtools-contentscript') &&
        event.data.target === 'infinite-table-page'
      ) {
        if (!(window as any).__INFINITE_TABLE_DEVTOOLS_HOOK__) {
          setupHook();

          // notify others that the hook fn is ready and can be used
          HOOK_FN_SETUP_CALLBACK(
            (window as any).__INFINITE_TABLE_DEVTOOLS_HOOK__,
          );
        }

        if (typeof event.data.type === 'string') {
          const eventType = event.data.type as keyof typeof DEVTOOLS_MESSAGES;
          const fn = DEVTOOLS_MESSAGES[eventType];
          if (fn) {
            fn(event.data.payload);
          }
        }
      }
    });
  }
}

listenForDevTools();

export function useDevTools() {
  const {
    getState,
    getComputed,
    getDataSourceState,
    dataSourceActions,
    actions,
    dataSourceApi,
    api,
  } = useInfiniteTable();

  const state = getState();

  const debugId = state.debugId;

  const debugIdRef = useRef(debugId);
  debugIdRef.current = debugId;

  useEffect(() => {
    const debugId = debugIdRef.current;
    if (!debugId) {
      return;
    }

    const withHookFn = (hookFn: DevToolsHookFn) => {
      hookFn(debugId, {
        getState,
        getDataSourceState,
        getComputed,
        dataSourceActions,
        actions,
        api,
        dataSourceApi,
      });
    };

    // on mount, check if hook fn already exists

    const hookFn = HOOK_FN_SETUP_CALLBACK.get();
    if (hookFn) {
      // hook fn already exists, so we can call it immediately
      withHookFn(hookFn);
      // and no need to further listen for changes
      return;
    }

    // otherwise wait for devtools hook fn to be setup
    return HOOK_FN_SETUP_CALLBACK.onChange((hookFn) => {
      if (!hookFn) {
        return;
      }
      // and call it
      withHookFn(hookFn);
    });
  }, []);

  // also call it after any render
  useEffect(() => {
    const debugId = debugIdRef.current;
    if (!debugId) {
      return;
    }

    const hookFn = HOOK_FN_SETUP_CALLBACK.get();

    if (hookFn) {
      hookFn(debugId, {
        getState,
        getDataSourceState,
        getComputed,
        dataSourceActions,
        actions,
        api,
        dataSourceApi,
      });
    }
  });

  useEffect(() => {
    if (!debugId) {
      return;
    }

    return () => {
      const devtoolsHookFn = (globalThis as any)
        .__INFINITE_TABLE_DEVTOOLS_HOOK__ as DevToolsHookFn | undefined;

      if (devtoolsHookFn) {
        devtoolsHookFn(debugId, null);
      }
    };
  }, [debugId]);

  return debugId;
}

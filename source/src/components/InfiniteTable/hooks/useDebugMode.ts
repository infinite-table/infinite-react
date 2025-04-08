import { useEffect, useRef } from 'react';
import { once } from '../../../utils/DeepMap/once';
import type { DebugTimingKey } from '../../DataSource';

import { stripVar } from '../../../utils/stripVar';

import { CSS_LOADED_VALUE, ThemeVars } from '../vars.css';
import { useInfiniteTable } from './useInfiniteTable';
import {
  DevToolsDataSourceOverrides,
  DevToolsHookFn,
  DevToolsHookFnOptions,
  DevToolsHostPageMessage,
  DevToolsInfiniteOverrides,
} from '../types/DevTools';

import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';
import { InfiniteTablePropGroupRenderStrategy } from '../types/InfiniteTableProps';
import {
  DEV_TOOLS_INFINITE_OVERRIDES,
  DEV_TOOLS_DATASOURCE_OVERRIDES,
} from '../../../DEV_TOOLS_OVERRIDES';
const logWarning = once(() => {
  console.warn(
    `It appears you have not loaded the CSS file for InfiniteTable.
In most environments, you should be able to fix this by adding the following line:

import '@infinite-table/infinite-react/index.css'

`,
  );
});

const cssFileLoadedVarName = stripVar(ThemeVars.loaded);

function buildMessageForExtension(
  params: { type: DevToolsHostPageMessage['type']; debugId: string },
  options: DevToolsHookFnOptions | null,
): DevToolsHostPageMessage {
  const { type, debugId } = params;
  const base = {
    source: 'infinite-table-page',
    target: 'infinite-table-devtools-background',
  } as const;
  if (type === 'unmount') {
    return {
      ...base,
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
    ...base,
    type,
    payload: {
      debugId,
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
      devToolsDetected: state.devToolsDetected,
      debugTimings: Object.fromEntries(dataSourceState.debugTimings) as Record<
        DebugTimingKey,
        number
      >,
    },
  };

  return message;
}

const INSTANCES = new Map<string, DevToolsHookFnOptions>();

function setDevToolInfinitePropertyOverride(
  debugId: string,
  property: keyof DevToolsInfiniteOverrides,
  value: DevToolsInfiniteOverrides[keyof DevToolsInfiniteOverrides],
) {
  const instance = INSTANCES.get(debugId);

  if (!instance) {
    return;
  }

  DEV_TOOLS_INFINITE_OVERRIDES.set(debugId, {
    ...(DEV_TOOLS_INFINITE_OVERRIDES.get(debugId) || {}),
    [property]: value,
  });

  instance.actions.forceBodyRerenderTimestamp = Date.now();
}

function setDevToolDataSourcePropertyOverride(
  debugId: string,
  property: keyof DevToolsDataSourceOverrides,
  value: DevToolsDataSourceOverrides[keyof DevToolsDataSourceOverrides],
) {
  const instance = INSTANCES.get(debugId);

  if (!instance) {
    return;
  }

  DEV_TOOLS_DATASOURCE_OVERRIDES.set(debugId, {
    ...(DEV_TOOLS_DATASOURCE_OVERRIDES.get(debugId) || {}),
    [property]: value,
  });

  instance.dataSourceActions.forceRerenderTimestamp = Date.now();
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
      INSTANCES.delete(debugId);
      DEV_TOOLS_INFINITE_OVERRIDES.delete(debugId);
      DEV_TOOLS_DATASOURCE_OVERRIDES.delete(debugId);
      window.postMessage(
        buildMessageForExtension({ type: 'unmount', debugId }, null),
      );
    }
  };

  (window as any).__INFINITE_TABLE_DEVTOOLS_HOOK__ = hookFn;

  return hookFn;
});

export function useDebugMode() {
  const { getState } = useInfiniteTable();

  const state = getState();
  const { domRef, debugId } = state;

  if (debugId) {
    if (domRef.current) {
      const value = getComputedStyle(domRef.current).getPropertyValue(
        cssFileLoadedVarName,
      );

      if (value !== `${CSS_LOADED_VALUE}`) {
        logWarning();
      }
    }
  }

  return useDevTools();
}

const HOOK_FN_SETUP_CALLBACK = buildSubscriptionCallback<DevToolsHookFn>();

const DEVTOOLS_MESSAGES = {
  setColumnVisibility: (payload: {
    columnId: string;
    visible: boolean;
    debugId: string;
  }) => {
    const instance = INSTANCES.get(payload.debugId);
    if (instance) {
      const columnVisibility = {
        ...instance.getState().columnVisibility,
      };
      if (payload.visible) {
        delete columnVisibility[payload.columnId];
      } else {
        columnVisibility[payload.columnId] = false;
      }

      setDevToolInfinitePropertyOverride(
        payload.debugId,
        'columnVisibility',
        columnVisibility,
      );
    }
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
  highlight: (payload: { debugId: string }) => {
    const instance = INSTANCES.get(payload.debugId);
    if (instance) {
      const domNode = instance.getState().domRef.current;

      if (domNode) {
        const rect = domNode.getBoundingClientRect();

        let overlay = document.querySelector(
          '.infinite-devtools-overlay',
        ) as HTMLElement;

        if (!overlay) {
          overlay = document.createElement('div');
          overlay.classList.add('infinite-devtools-overlay');
          document.body.appendChild(overlay);
        }

        if (overlay) {
          // First set the position and size
          overlay.style.left = `${rect.left}px`;
          overlay.style.top = `${rect.top}px`;
          overlay.style.width = `${rect.width}px`;
          overlay.style.height = `${rect.height}px`;

          // Force a reflow to ensure the initial styles are applied
          overlay.offsetHeight;

          // Add the active class to trigger the show animation
          overlay.classList.add('infinite-devtools-overlay--active');

          // Remove the active class after the show animation completes
          const handleTransitionEnd = () => {
            overlay.classList.remove('infinite-devtools-overlay--active');
            overlay.removeEventListener('transitionend', handleTransitionEnd);
          };

          overlay.addEventListener('transitionend', handleTransitionEnd);
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

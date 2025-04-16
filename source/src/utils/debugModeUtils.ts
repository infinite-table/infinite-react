import { ERROR_CODES } from '../components/InfiniteTable/errorCodes';
import type {
  DebugWarningPayload,
  DevToolsDataSourceOverrides,
  DevToolsHookFn,
  DevToolsHookFnOptions,
  DevToolsInfiniteOverrides,
  ErrorCodeKey,
  InfiniteTableDebugWarningKey,
} from '../components/InfiniteTable/types/DevTools';

import {
  DEV_TOOLS_DATASOURCE_INITIALS,
  DEV_TOOLS_DATASOURCE_OVERRIDES,
  DEV_TOOLS_INFINITE_INITIALS,
  DEV_TOOLS_INFINITE_OVERRIDES,
} from '../DEV_TOOLS_OVERRIDES';
import { dbg, err } from './debugLoggers';

import {
  errorOnce as errorOnceLogger,
  warnOnce as warnOnceLogger,
} from './logger';

export const INSTANCES = new Map<string, DevToolsHookFnOptions>();

export const deleteInstanceFromDevTools = (debugId: string) => {
  INSTANCES.delete(debugId);
  DEV_TOOLS_INFINITE_INITIALS.delete(debugId);
  DEV_TOOLS_INFINITE_OVERRIDES.delete(debugId);
  DEV_TOOLS_DATASOURCE_INITIALS.delete(debugId);
  DEV_TOOLS_DATASOURCE_OVERRIDES.delete(debugId);
};

export function setDevToolInfinitePropertyOverride(
  debugId: string,
  property: keyof DevToolsInfiniteOverrides,
  value: DevToolsInfiniteOverrides[keyof DevToolsInfiniteOverrides],
) {
  const instance = INSTANCES.get(debugId);

  if (!instance) {
    return;
  }

  const initial = DEV_TOOLS_INFINITE_INITIALS.get(debugId);
  if (!initial || !Object.hasOwn(initial, property)) {
    DEV_TOOLS_INFINITE_INITIALS.set(debugId, {
      ...(initial || {}),
      [property]: instance.getState()[property],
    });
  }

  DEV_TOOLS_INFINITE_OVERRIDES.set(debugId, {
    ...(DEV_TOOLS_INFINITE_OVERRIDES.get(debugId) || {}),
    [property]: value,
  });

  // @ts-ignore
  instance.actions[property] = value;
}

export function setDevToolDataSourcePropertyOverride(
  debugId: string,
  property: keyof DevToolsDataSourceOverrides,
  value: DevToolsDataSourceOverrides[keyof DevToolsDataSourceOverrides],
) {
  const instance = INSTANCES.get(debugId);

  if (!instance) {
    return;
  }

  const initial = DEV_TOOLS_DATASOURCE_INITIALS.get(debugId);

  if (!initial || !Object.hasOwn(initial, property)) {
    DEV_TOOLS_DATASOURCE_INITIALS.set(debugId, {
      ...(initial || {}),
      [property]: instance.getDataSourceState()[property],
    });
  }

  DEV_TOOLS_DATASOURCE_OVERRIDES.set(debugId, {
    ...(DEV_TOOLS_DATASOURCE_OVERRIDES.get(debugId) || {}),
    [property]: value,
  });

  // @ts-ignore
  instance.dataSourceActions[property] = value;
}

// const consoleWarnLogger = console.warn.bind(console);
// const consoleErrorLogger = console.error.bind(console);

const warnKnownErrorOnce = (error: DebugWarningPayload) => {
  const logger =
    error.type === 'error' ? err(error.debugId) : dbg(error.debugId);

  const onceLogger = error.type === 'error' ? errorOnceLogger : warnOnceLogger;

  const onceKey = error.debugId ? `${error.code}-${error.debugId}` : error.code;
  let message = error.message;

  if (error.debugId) {
    message = `${message}

Component DEBUG_ID = "${error.debugId}"`;
  }

  onceLogger(message, onceKey, logger);
};

export const logDevToolsWarning = (options: {
  debugId?: string;
  key: ErrorCodeKey;
}) => {
  const { debugId, key } = options;
  const knownError = ERROR_CODES[key];

  if (!knownError) {
    return;
  }

  warnKnownErrorOnce({ ...knownError, debugId });

  if (debugId && key) {
    const instance = INSTANCES.get(debugId);

    if (instance && instance.getState().devToolsDetected && knownError) {
      instance
        .getState()
        .debugWarnings.set(key as InfiniteTableDebugWarningKey, {
          ...knownError,
          debugId,
          status: 'new',
        });

      updateDevToolsForInstance(debugId);
    }
  }
};

(globalThis as any).logDevToolsWarning = logDevToolsWarning;

export const updateDevToolsForInstance = (debugId: string) => {
  const hookFn = (window as any)
    .__INFINITE_TABLE_DEVTOOLS_HOOK__ as DevToolsHookFn;

  if (!hookFn) {
    return;
  }
  const instance = INSTANCES.get(debugId);
  if (!instance) {
    return;
  }

  hookFn(debugId, instance);
};

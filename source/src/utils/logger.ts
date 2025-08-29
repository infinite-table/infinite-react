import { debug, DebugLogger } from './debugPackage';
import { DeepMap } from './DeepMap';

export const log: DebugLogger = debug('IT:InfiniteTable');

export const COLOR_ERROR_VALUE = `#dc3545`;
export const COLOR_WARN_VALUE = `#eb9316`;
export const COLOR_INFO_VALUE = `#17a2b8`;
export const COLOR_SUCCESS_VALUE = `#419641`;
export const COLOR_ACCENT_VALUE = `#07c`;

const warnChannel = 'Warn';
const errorChannel = 'Error';
const infoChannel = 'Info';
const successChannel = 'Success';
const logChannel = 'Logs';

const logger = log.extend(logChannel);
const infoLogger = logger.extend(infoChannel);
const warnLogger = logger.extend(warnChannel);
const errorLogger = logger.extend(errorChannel);
const successLogger = logger.extend(successChannel);

export const logColorInfo = COLOR_INFO_VALUE;
export const logColorWarn = COLOR_WARN_VALUE;
export const logColorError = COLOR_ERROR_VALUE;
export const logColorSuccess = COLOR_SUCCESS_VALUE;

type LogFn = typeof console.log;

export const info = (message: string, logger?: DebugLogger | LogFn) => {
  if (!logger) {
    logger = logger || infoLogger;
    logger(log.color(logColorInfo, message));
  } else {
    logger(message);
  }
};

export const warn = (message: string, logger?: DebugLogger | LogFn) => {
  logger = logger
    ? (logger as DebugLogger).extend
      ? (logger as DebugLogger).extend(warnChannel)
      : logger
    : warnLogger;

  logger(
    typeof (logger as DebugLogger).color === 'function'
      ? (logger as DebugLogger).color(logColorWarn, message)
      : message,
  );
};
export const error = (message: string, logger?: DebugLogger | LogFn) => {
  logger = logger
    ? (logger as DebugLogger).extend
      ? (logger as DebugLogger).extend(errorChannel)
      : logger
    : errorLogger;
  logger(
    typeof (logger as DebugLogger).color === 'function'
      ? (logger as DebugLogger).color(logColorError, message)
      : message,
  );
};
export const success = (message: string, logger?: DebugLogger | LogFn) => {
  logger = logger
    ? (logger as DebugLogger).extend
      ? (logger as DebugLogger).extend(successChannel)
      : logger
    : successLogger;

  logger(
    typeof (logger as DebugLogger).color === 'function'
      ? (logger as DebugLogger).color(logColorSuccess, message)
      : message,
  );
};

const doOnceFlags: DeepMap<string, boolean> = new DeepMap();

const doOnce = (func: () => void, ...keys: string[]) => {
  if (doOnceFlags.has(keys)) {
    return;
  }

  doOnceFlags.set(keys, true);
  func();
};

export const infoOnce = (
  message: string,
  key = message,
  logger?: DebugLogger | LogFn,
) => {
  doOnce(() => info(message, logger), key, 'info');
};

export const warnOnce = (
  message: string,
  key = message,
  logger?: DebugLogger | LogFn,
) => {
  doOnce(() => warn(message, logger), key, 'warn');
};

export const errorOnce = (
  message: string,
  key = message,
  logger?: DebugLogger | LogFn,
) => {
  doOnce(() => error(message, logger), key, 'error');
};

export const successOnce = (
  message: string,
  key = message,
  logger?: DebugLogger | LogFn,
) => {
  doOnce(() => success(message, logger), key, 'success');
};

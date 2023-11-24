import { DeepMap } from './DeepMap';
import { getGlobal } from './getGlobal';

const colors = [
  '#0000CC',
  '#0000FF',
  '#0033CC',
  '#0033FF',
  '#0066CC',
  '#0066FF',
  '#0099CC',
  '#0099FF',
  '#00CC00',
  '#00CC33',
  '#00CC66',
  '#00CC99',
  '#00CCCC',
  '#00CCFF',
  '#3300CC',
  '#3300FF',
  '#3333CC',
  '#3333FF',
  '#3366CC',
  '#3366FF',
  '#3399CC',
  '#3399FF',
  '#33CC00',
  '#33CC33',
  '#33CC66',
  '#33CC99',
  '#33CCCC',
  '#33CCFF',
  '#6600CC',
  '#6600FF',
  '#6633CC',
  '#6633FF',
  '#66CC00',
  '#66CC33',
  '#9900CC',
  '#9900FF',
  '#9933CC',
  '#9933FF',
  '#99CC00',
  '#99CC33',
  '#CC0000',
  '#CC0033',
  '#CC0066',
  '#CC0099',
  '#CC00CC',
  '#CC00FF',
  '#CC3300',
  '#CC3333',
  '#CC3366',
  '#CC3399',
  '#CC33CC',
  '#CC33FF',
  '#CC6600',
  '#CC6633',
  '#CC9900',
  '#CC9933',
  '#CCCC00',
  '#CCCC33',
  '#FF0000',
  '#FF0033',
  '#FF0066',
  '#FF0099',
  '#FF00CC',
  '#FF00FF',
  '#FF3300',
  '#FF3333',
  '#FF3366',
  '#FF3399',
  '#FF33CC',
  '#FF33FF',
  '#FF6600',
  '#FF6633',
  '#FF9900',
  '#FF9933',
  '#FFCC00',
  '#FFCC33',
];

const usedColors = colors.map((_) => 0);

const getNextColor = () => {
  // get index of min value
  const index = usedColors.reduce(
    (iMin, x, i, arr) => (x < arr[iMin] ? i : iMin),
    0,
  );
  usedColors[index]++;
  return colors[index];
};

type DebugLogger = {
  (...args: any[]): void;
  extend: (channelName: string) => DebugLogger;
  enabled: boolean;
  channel: string;
  log: (...args: any[]) => void;
};

const CHANNEL_SEPARATOR = ':';
const CHANNEL_WILDCARD = '*';
const STORAGE_SEPARATOR = ',';
const STORAGE_KEY = 'debug';

const STORAGE_DIFF_KEY = 'diffdebug';
const DEFAULT_LOG_DIFF = false;

export function debug(channelName: string): any {
  const loggers = new DeepMap<string, DebugLogger>();

  const defaultLogger = console.log.bind(console);

  const getStorageKeyValue = () =>
    (getGlobal() && getGlobal().localStorage?.getItem(STORAGE_KEY)) ?? '';
  const getDiffStorageKeyValue = () =>
    (getGlobal() && getGlobal().localStorage?.getItem(STORAGE_DIFF_KEY)) ??
    `${DEFAULT_LOG_DIFF}`;

  let storageKeyValue = '';

  let logDiffs = DEFAULT_LOG_DIFF;

  function updateStorageKeyValue(value: string) {
    logDiffs = getDiffStorageKeyValue() === 'true';
    if (storageKeyValue === value) {
      return;
    }
    storageKeyValue = value;
  }

  updateStorageKeyValue(getStorageKeyValue());

  typeof getGlobal() !== 'undefined' &&
    getGlobal().addEventListener &&
    getGlobal().addEventListener('storage', function () {
      updateStorageKeyValue(getStorageKeyValue());
    });

  function isLoggingEnabled(channel: string): boolean {
    const parts = channel.split(CHANNEL_SEPARATOR);

    const partsMap = new DeepMap<string, boolean>();
    partsMap.set(parts, true);

    const multipleStorageValues = storageKeyValue.split(STORAGE_SEPARATOR);

    // we accept a storage value like "a:b:c,d:e:f" so we want
    // to account for that here - multiple values separated by a comma
    for (let i = 0; i < multipleStorageValues.length; i++) {
      const storageValue = multipleStorageValues[i];

      const storageValueParts = storageValue.split(CHANNEL_SEPARATOR);

      const hasWildcard = new Set(storageValueParts).has(CHANNEL_WILDCARD);

      const storagePartsWithoutWildcard = hasWildcard
        ? storageValueParts.slice(
            0,
            storageValueParts.indexOf(CHANNEL_WILDCARD),
          )
        : storageValueParts;

      if (
        partsMap.getKeysStartingWith(storagePartsWithoutWildcard, hasWildcard)
          .length > 0
      ) {
        return true;
      }
    }

    return false;
  }

  function debugFactory(channelName: string, parentChannel?: string): any {
    const channel = parentChannel
      ? `${parentChannel}${CHANNEL_SEPARATOR}${channelName}`
      : channelName;

    const channelParts = channel.split(CHANNEL_SEPARATOR);
    if (loggers.has(channelParts)) {
      return loggers.get(channelParts);
    }

    const parentLogger = loggers.get(channelParts.slice(0, -1));

    let logFn = parentLogger ? parentLogger.log : defaultLogger;

    let enabled: boolean | undefined;
    let lastMessageTimestamp: number = 0;
    const isEnabled = () => enabled ?? isLoggingEnabled(channel);
    const color = getNextColor();

    const logger = Object.defineProperties(
      (...args: any[]) => {
        if (isLoggingEnabled(channel)) {
          const now = Date.now();

          if (lastMessageTimestamp && logDiffs) {
            const diff = now - lastMessageTimestamp;

            logFn(`%c+${diff}ms:`, `color: ${color}`);
          }
          lastMessageTimestamp = now;

          // with colors
          logFn(`%c[${channel}]`, `color: ${color}`, ...args);
        }
      },
      {
        channel: {
          value: channel,
        },
        extend: {
          value: (nextChannel: string) => {
            return debugFactory(nextChannel, channel);
          },
        },
        enabled: {
          get: () => isEnabled(),
        },
        log: {
          get: () => logFn,
          set: (fn) => {
            logFn = fn;
          },
        },
      },
    ) as DebugLogger;

    loggers.set(channelParts, logger);

    return logger;
  }

  return debugFactory(channelName);
}

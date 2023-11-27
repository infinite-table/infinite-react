import { DeepMap } from './DeepMap';
import { getGlobal } from './getGlobal';

// colors take from the `debug` package on npm
const COLORS = [
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

const USED_COLORS_MAP = new WeakMap<string[], number[]>();

USED_COLORS_MAP.set(
  COLORS,
  COLORS.map((_) => 0),
);

const getNextColor = (colors = COLORS) => {
  let usedColors: number[] = [];

  // whenever we have a new set of colors
  // we need to have a new array for counting which colors are used
  // this is the usedColors array
  if (USED_COLORS_MAP.has(colors)) {
    usedColors = USED_COLORS_MAP.get(colors)!;
  } else {
    usedColors = colors.map((_) => 0);
    USED_COLORS_MAP.set(colors, usedColors);
  }

  // get index of min value
  const index = usedColors.reduce(
    (iMin, x, i, arr) => (x < arr[iMin] ? i : iMin),
    0,
  );
  if (usedColors[index] != undefined) {
    usedColors[index]++;
  }
  return colors[index] ?? colors[0] ?? COLORS[0];
};

export type DebugLogger = {
  (...args: any[]): void;
  extend: (channelName: string) => DebugLogger;
  enabled: boolean;
  channel: string;
  destroy: () => void;
  log: (...args: any[]) => void;
};

const CHANNEL_SEPARATOR = ':';
const CHANNEL_WILDCARD = '*';
const CHANNEL_NEGATION_CHAR = '-';
const STORAGE_SEPARATOR = ',';
const STORAGE_KEY = 'debug';

const STORAGE_DIFF_KEY = 'diffdebug';
const DEFAULT_LOG_DIFF = false;

const loggers = new DeepMap<string, DebugLogger>();

const enabledChannelsCache = new Map<string, boolean>();

/**
 * Returns if the specified channel is spefically targeted by the permission token.
 * If the permission token does not contain the channel, it returns undefined.
 *
 * @param channel A specific channel like "a:b:c" - cannot contain wildcards
 * @param permissionToken a permission token like "a:b:c" or "d:e:f" or "d:x:*" or "*" - the value can contain wildcards, but cannot have comma separated values
 *
 */
function isChannelTargeted(channel: string, permissionToken: string) {
  const parts = channel.split(CHANNEL_SEPARATOR);
  const partsMap = new DeepMap<string, boolean>();
  partsMap.set(parts, true);

  const tokenParts = permissionToken.split(CHANNEL_SEPARATOR);

  const hasWildcard = new Set(tokenParts).has(CHANNEL_WILDCARD);

  const storagePartsWithoutWildcard = hasWildcard
    ? tokenParts.slice(0, tokenParts.indexOf(CHANNEL_WILDCARD))
    : tokenParts;

  if (
    partsMap.getKeysStartingWith(storagePartsWithoutWildcard, hasWildcard)
      .length > 0
  ) {
    return true;
  }
  return undefined;
}

/**
 * Returns whether logging is enabled for a specific channel
 *
 * @param channel the name of a specific channel like "a:b:c" - cannot contain wildcards
 * @param permissions we accept values like "a:b:c,d:e:f,d:x:*" - multiple values separated by a comma. can also contain wildcards
 * @returns boolean
 */
export function isLoggingEnabled(
  channel: string,
  permissions: string,
): boolean {
  const cacheKey = `channel=${channel}_permissions=${permissions}`;

  if (enabledChannelsCache.has(cacheKey)) {
    return enabledChannelsCache.get(cacheKey)!;
  }

  const permissionTokens = permissions.split(STORAGE_SEPARATOR);

  function done(result: boolean) {
    enabledChannelsCache.set(cacheKey, result);
    return result;
  }

  const exactTokens: string[] = [];
  const wildcardTokens: string[] = [];

  permissionTokens.forEach((permissionToken) => {
    if (permissionToken.includes(CHANNEL_WILDCARD)) {
      wildcardTokens.push(permissionToken);
    } else {
      exactTokens.push(permissionToken);
    }
  });

  for (let i = 0; i < exactTokens.length; i++) {
    let exactToken = exactTokens[i];

    const negative = exactToken.startsWith(CHANNEL_NEGATION_CHAR);

    if (negative) {
      exactToken = exactToken.substring(CHANNEL_NEGATION_CHAR.length);
    }
    if (isChannelTargeted(channel, exactToken)) {
      return done(negative ? false : true);
    }
  }

  for (let i = 0; i < wildcardTokens.length; i++) {
    let permissionToken = wildcardTokens[i];

    const negated = permissionToken.startsWith('-');

    if (negated) {
      permissionToken = permissionToken.substring(1);
    }

    if (isChannelTargeted(channel, permissionToken)) {
      return done(negated ? false : true);
    }
  }

  return done(false);
}

const getStorageKeyValue = () =>
  debug.enable ??
  (getGlobal() && getGlobal().localStorage?.getItem(STORAGE_KEY)) ??
  '';

const getDiffStorageKeyValue = () =>
  debug.diffenable ??
  (getGlobal() && getGlobal().localStorage?.getItem(STORAGE_DIFF_KEY)) ??
  `${DEFAULT_LOG_DIFF}`;

let storageKeyValue = '';
let logDiffs = DEFAULT_LOG_DIFF;

function updateStorageKeyValue(value: string) {
  logDiffs = `${getDiffStorageKeyValue()}` == 'true';
  if (storageKeyValue === value) {
    return;
  }
  storageKeyValue = value;
  enabledChannelsCache.clear();
}

function debugPackage(channelName: string): any {
  updateStorageKeyValue(getStorageKeyValue());

  typeof getGlobal() !== 'undefined' &&
    getGlobal().addEventListener &&
    getGlobal().addEventListener('storage', function () {
      updateStorageKeyValue(getStorageKeyValue());
    });

  function debugFactory(channelName: string, parentChannel?: string): any {
    const channel = parentChannel
      ? `${parentChannel}${CHANNEL_SEPARATOR}${channelName}`
      : channelName;

    const channelParts = channel.split(CHANNEL_SEPARATOR);

    if (loggers.has(channelParts)) {
      return loggers.get(channelParts);
    }

    const parentLogger = loggers.get(channelParts.slice(0, -1));

    let logFn = parentLogger ? parentLogger.log : debug.log;

    let enabled: boolean | undefined;
    let lastMessageTimestamp: number = 0;
    const isEnabled = () =>
      enabled ?? isLoggingEnabled(channel, storageKeyValue);

    const color = getNextColor(debug.colors);

    const logger = Object.defineProperties(
      (...args: any[]) => {
        if (isLoggingEnabled(channel, storageKeyValue)) {
          const now = Date.now();

          if (lastMessageTimestamp && logDiffs) {
            const diff = now - lastMessageTimestamp;

            logFn(`%c[${channel}]`, `color: ${color}`, `+${diff}ms:`);
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
        destroy: {
          value: () => {
            loggers.delete(channelParts);
          },
        },
      },
    ) as DebugLogger;

    loggers.set(channelParts, logger);

    return logger;
  }

  return debugFactory(channelName);
}

const defaultLogger = console.log.bind(console);

let GLOBAL_ENABLE: string | undefined = undefined;

Object.defineProperty(debugPackage, 'enable', {
  get: () => GLOBAL_ENABLE,
  set: (value: string | undefined) => {
    GLOBAL_ENABLE = value;
    updateStorageKeyValue(getStorageKeyValue());
  },
});

const debug = debugPackage as {
  (channelName: string): DebugLogger;
  colors: string[];
  enable: string;
  diffenable: string | boolean;
  log: DebugLogger['log'];
};

debug.colors = COLORS;
debug.log = defaultLogger;

export { debug };

import { debug } from './debugPackage';

export interface LogFn {
  (...args: any[]): void;
  extend: (channelName: string) => LogFn;
}
export const dbg = (channelName?: string) => {
  const result = debug(
    channelName ? `${channelName}:TYPE=debug` : 'TYPE=debug',
  );

  result.logFn = console.log.bind(console);

  return result;
};

export const err = (channelName?: string) => {
  const result = debug(
    channelName ? `${channelName}:TYPE=error` : 'TYPE=error',
  );

  result.logFn = console.error.bind(console);

  return result;
};

const emptyLogFn = () => emptyLogFn;
emptyLogFn.extend = () => emptyLogFn;

export class Logger {
  debug: LogFn;
  error: LogFn;

  constructor(channelName: string) {
    this.debug = emptyLogFn;
    this.error = emptyLogFn;
    if (__DEV__) {
      this.debug = dbg(channelName);
      this.error = err(channelName);
    }
  }
}

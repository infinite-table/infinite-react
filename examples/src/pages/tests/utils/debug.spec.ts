import { debug, isLoggingEnabled } from '@src/utils/debugPackage';
import { test, expect } from '@playwright/test';

debug.colors = ['red', 'green', 'blue'];

export default test.describe.parallel('debug', () => {
  test('should reuse the same color for same channel', () => {
    debug.enable = '*';
    debug.log = (...x: string[]) => {
      args = x;
    };
    const logger1a = debug('channel1');
    const logger1b = debug('channel1');

    let args: string[] = [];

    logger1a('testing');
    expect(args).toEqual(['%c[channel1]', 'color: red', 'testing']);
    logger1b('abc');
    expect(args).toEqual(['%c[channel1]', 'color: red', 'abc']);

    // destroying it dettaches the channel from the color
    logger1b.destroy();

    // so a new logger on the same channel will get a new color, if the old one is destroyed
    const logger1c = debug('channel1');
    logger1c('xyz');
    expect(args).toEqual(['%c[channel1]', 'color: green', 'xyz']);
  });

  test('should only log for enabled channels', () => {
    let args: string[] = [];
    debug.enable = 'channel2,channel1:*';
    debug.log = (...x: string[]) => {
      args = x;
    };
    const onea = debug('channel1:a');
    const oneb = debug('channel1:b');
    const two = debug('channel2');
    const three = debug('channel3');

    onea('1a');
    expect(args).toEqual(['%c[channel1:a]', 'color: red', '1a']);
    oneb('1b');
    expect(args).toEqual(['%c[channel1:b]', 'color: green', '1b']);

    two('2');
    expect(args).toEqual(['%c[channel2]', 'color: blue', '2']);

    three('3');
    // same as 2, since 3 is not enabled
    expect(args).toEqual(['%c[channel2]', 'color: blue', '2']);
  });

  test.skip('channel negation not working yet', () => {
    let args: string[] = [];
    debug.enable = 'channel1:*,-channel1:b';
    debug.log = (...x: string[]) => {
      args = x;
    };
    const onea = debug('channel1:a');
    const oneb = debug('channel1:b');

    onea('1a');
    expect(args).toEqual(['%c[channel1:a]', 'color: red', '1a']);
    oneb('1b');
    // not logged
    expect(args).toEqual(['%c[channel1:a]', 'color: red', '1a']);
  });

  test('isLoggingEnabled', () => {
    expect(isLoggingEnabled('channel1', '*')).toBe(true);
    expect(isLoggingEnabled('channel1:b', '*')).toBe(true);
    expect(isLoggingEnabled('channel1:b', '*')).toBe(true);
    expect(isLoggingEnabled('channel1', 'channel1:*')).toBe(false);
    expect(isLoggingEnabled('channel1:a', 'channel1:*')).toBe(true);
    expect(isLoggingEnabled('channel2:a', 'channel1:*')).toBe(false);
    expect(isLoggingEnabled('channel2:a', 'channel1:*,*')).toBe(true);

    expect(isLoggingEnabled('channel1:a:b', 'channel1:*')).toBe(true);
    expect(isLoggingEnabled('channel1:a:b', 'a,channel1:*,x,y')).toBe(true);
    expect(isLoggingEnabled('channel1x:a:b', 'a,channel1:*,x,y')).toBe(false);

    expect(isLoggingEnabled('channel1:a', 'xyz,channel1:*,channel2')).toBe(
      true,
    );
    expect(isLoggingEnabled('channel1:a:b', 'xyz,channel1:*,channel2')).toBe(
      true,
    );
    expect(isLoggingEnabled('xyz', 'xyz,channel1:*,channel2')).toBe(true);
  });

  test('isLoggingEnabled - test for simple negations', () => {
    expect(isLoggingEnabled('channel1', 'channel1:*,-channel1:b')).toBe(false);
    expect(isLoggingEnabled('channel1:x', 'channel1:*,-channel1:b')).toBe(true);
    expect(isLoggingEnabled('channel1:x:y', 'channel1:*,-channel1:b')).toBe(
      true,
    );

    expect(isLoggingEnabled('channel1:b', 'channel1:*,-channel1:b')).toBe(
      false,
    );

    expect(isLoggingEnabled('channel1:b', 'channel1:*,-channel1:b:c')).toBe(
      true,
    );
    expect(isLoggingEnabled('channel1:b', 'channel1:*,-channel1:b:c')).toBe(
      true,
    );
    expect(isLoggingEnabled('channel1:b:d', 'channel1:*,-channel1:b:c')).toBe(
      true,
    );
    expect(isLoggingEnabled('channel1:b:c', 'channel1:*,-channel1:b:c')).toBe(
      false,
    );
  });
});

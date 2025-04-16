import { debug, isChannelEnabled } from '@src/utils/debugPackage';
import { test, expect } from '@playwright/test';

debug.colors = ['red', 'green', 'blue'];

export default test.describe.parallel('debug', () => {
  test('logging with color', () => {
    let args: string[] = [];

    debug.destroyAll();
    debug.enable = '*';
    debug.logFn = (...x: string[]) => {
      args = x;
    };

    const logger1 = debug('channel1');

    logger1(logger1.color('blue', 'testing'), 'works');
    expect(args).toEqual([
      '%c[channel1]%c %s',
      'color: red',
      '',
      '%ctesting%c%s',
      'color: blue',
      '',
      'works%s',
      '',
    ]);
  });
  test('should reuse the same color for same channel', () => {
    debug.destroyAll();
    debug.enable = '*';
    debug.logFn = (...x: string[]) => {
      args = x;
    };
    const logger1a = debug('channel1');
    const logger1b = debug('channel1');

    let args: string[] = [];

    logger1a('testing');
    expect(args).toEqual(['%c[channel1]%c %s', 'color: red', '', 'testing']);
    logger1b('abc');
    expect(args).toEqual(['%c[channel1]%c %s', 'color: red', '', 'abc']);

    // destroying it dettaches the channel from the color
    logger1b.destroy();

    // so a new logger on the same channel will get a new color, if the old one is destroyed
    const logger1c = debug('channel1');
    logger1c('xyz');
    expect(args).toEqual(['%c[channel1]%c %s', 'color: green', '', 'xyz']);
  });

  test('should allow setting logFn for a channel', () => {
    let args: string[] = [];
    debug.destroyAll();
    debug.enable = '*';
    debug.logFn = (...x: string[]) => {
      args = x;
    };
    const logger1 = debug('channel1');

    logger1('testing');
    expect(args).toEqual(['%c[channel1]%c %s', 'color: red', '', 'testing']);

    let customLoggerArgs: string[] = [];
    logger1.logFn = (...x: string[]) => {
      args = ['1'];
      customLoggerArgs = x;
    };

    logger1('second test');
    expect(args).toEqual(['1']);
    expect(customLoggerArgs).toEqual([
      '%c[channel1]%c %s',
      'color: red',
      '',
      'second test',
    ]);

    logger1.logFn = undefined;

    logger1('third test');
    expect(args).toEqual(['%c[channel1]%c %s', 'color: red', '', 'third test']);
    expect(customLoggerArgs).toEqual([
      '%c[channel1]%c %s',
      'color: red',
      '',
      'second test',
    ]);
  });

  test('should allow * use in the middle of the token', () => {
    let args: string[] = [];
    let prevArgs: string[] = [];
    debug.destroyAll();
    debug.enable = 'channel1:*:x';
    debug.logFn = (...x: string[]) => {
      args = x;
    };
    const oneax = debug('channel1:a:x');
    const onebx = debug('channel1:b:x');

    const oneaz = debug('channel1:a:z');
    const onecx = debug('channel1:c:x');

    const oneabx = debug('channel1:a:b:x');
    const oneabz = debug('channel1:a:b:z');

    oneax('1ax');
    expect(args).toEqual(['%c[channel1:a:x]%c %s', 'color: red', '', '1ax']);

    onebx('1bx');
    expect(args).toEqual(
      (prevArgs = ['%c[channel1:b:x]%c %s', 'color: green', '', '1bx']),
    );

    oneaz('1az');
    // expect no changes, since z is not enabled
    expect(args).toEqual(prevArgs);

    oneaz('1az');
    // expect no changes, since z is not enabled
    expect(args).toEqual(prevArgs);

    onecx('1cx');
    expect(args).toEqual(['%c[channel1:c:x]%c %s', 'color: red', '', '1cx']);

    oneabx('1abx');
    expect(args).toEqual(
      (prevArgs = ['%c[channel1:a:b:x]%c %s', 'color: green', '', '1abx']),
    );

    oneabz('1abz');
    // expect no change
    expect(args).toEqual(prevArgs);
  });

  test('should only log for enabled channels', () => {
    let args: string[] = [];
    debug.destroyAll();
    debug.enable = 'channel2,channel1:*';
    debug.logFn = (...x: string[]) => {
      args = x;
    };
    const onea = debug('channel1:a');
    const oneb = debug('channel1:b');
    const two = debug('channel2');
    const three = debug('channel3');

    onea('1a');
    expect(args).toEqual(['%c[channel1:a]%c %s', 'color: red', '', '1a']);

    oneb('1b');
    expect(args).toEqual(['%c[channel1:b]%c %s', 'color: green', '', '1b']);

    two('2');
    expect(args).toEqual(['%c[channel2]%c %s', 'color: blue', '', '2']);

    three('3');
    // same as 2, since 3 is not enabled
    expect(args).toEqual(['%c[channel2]%c %s', 'color: blue', '', '2']);
  });

  test('enabling individual loggers via logger.enabled prop', () => {
    let args: string[] = [];

    debug.destroyAll();
    debug.enable = 'channel1:*:x';
    debug.logFn = (...x: string[]) => {
      args = x;
    };

    const chOneax = debug('channel1:a:x');
    const chOneb = debug('channel1:b');

    chOneax('abc');
    expect(args).toEqual(['%c[channel1:a:x]%c %s', 'color: red', '', 'abc']);

    chOneb('oneb');
    expect(args).toEqual(['%c[channel1:a:x]%c %s', 'color: red', '', 'abc']);

    expect(chOneb.enabled).toBe(false);
    chOneb.enabled = true;
    expect(chOneb.enabled).toBe(true);
    chOneb('oneb');
    expect(args).toEqual(['%c[channel1:b]%c %s', 'color: green', '', 'oneb']);
  });

  test('channel negation working', () => {
    let args: string[] = [];
    let prevArgs: string[] = [];
    debug.destroyAll();
    debug.enable = 'channel1:*,-channel1:b';
    debug.logFn = (...x: string[]) => {
      args = x;
    };
    const onea = debug('channel1:a');
    const oneb = debug('channel1:b');

    onea('1a');
    expect(args).toEqual(
      (prevArgs = ['%c[channel1:a]%c %s', 'color: red', '', '1a']),
    );

    oneb('1b');
    // not logged
    expect(args).toEqual(prevArgs);
  });

  test('isLoggingEnabled', () => {
    expect(isChannelEnabled('channel1', '*')).toBe(true);
    expect(isChannelEnabled('channel1:b', '*')).toBe(true);
    expect(isChannelEnabled('channel1:b', '*')).toBe(true);
    expect(isChannelEnabled('channel1', 'channel1:*')).toBe(false);
    expect(isChannelEnabled('channel1:a', 'channel1:*')).toBe(true);
    expect(isChannelEnabled('channel2:a', 'channel1:*')).toBe(false);
    expect(isChannelEnabled('channel2:a', 'channel1:*,*')).toBe(true);

    expect(isChannelEnabled('channel1:a:b', 'channel1:*')).toBe(true);
    expect(isChannelEnabled('channel1:a:b', 'a,channel1:*,x,y')).toBe(true);
    expect(isChannelEnabled('channel1x:a:b', 'a,channel1:*,x,y')).toBe(false);

    expect(isChannelEnabled('channel1:a', 'xyz,channel1:*,channel2')).toBe(
      true,
    );
    expect(isChannelEnabled('channel1:a:b', 'xyz,channel1:*,channel2')).toBe(
      true,
    );
    expect(isChannelEnabled('xyz', 'xyz,channel1:*,channel2')).toBe(true);
  });

  test('isLoggingEnabled - test for simple negations', () => {
    expect(isChannelEnabled('channel1', 'channel1:*,-channel1:b')).toBe(false);
    expect(isChannelEnabled('channel1:x', 'channel1:*,-channel1:b')).toBe(true);
    expect(isChannelEnabled('channel1:x:y', 'channel1:*,-channel1:b')).toBe(
      true,
    );

    expect(isChannelEnabled('channel1:b', 'channel1:*,-channel1:b')).toBe(
      false,
    );

    expect(isChannelEnabled('channel1:b', 'channel1:*,-channel1:b:c')).toBe(
      true,
    );
    expect(isChannelEnabled('channel1:b', 'channel1:*,-channel1:b:c')).toBe(
      true,
    );
    expect(isChannelEnabled('channel1:b:d', 'channel1:*,-channel1:b:c')).toBe(
      true,
    );
    expect(isChannelEnabled('channel1:b:c', 'channel1:*,-channel1:b:c')).toBe(
      false,
    );
  });

  test('isLoggingEnabled - test for wildcard use', () => {
    const permissions = 'channel1:*:b';
    expect(isChannelEnabled('channel1', permissions)).toBe(false);
    expect(isChannelEnabled('channel1:b', permissions)).toBe(true);
    expect(isChannelEnabled('channel1:b', `${permissions},-channel1:b`)).toBe(
      false,
    );
    expect(isChannelEnabled('channel1:x:b', permissions)).toBe(true);
    expect(isChannelEnabled('channel1:x', permissions)).toBe(false);
  });
});

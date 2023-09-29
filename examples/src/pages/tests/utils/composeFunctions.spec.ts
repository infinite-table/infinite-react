import { composeFunctions } from '@src/utils/composeFunctions';
import { test, expect } from '@playwright/test';

export default test.describe.parallel('composeFunctions', () => {
  test('should work ok', () => {
    const theArgs: {
      name: string;
      args: number[];
    }[] = [];

    const fn = composeFunctions(
      (...args: number[]) => {
        theArgs.push({
          name: 'a',
          args: args,
        });
      },
      (...args: number[]) => {
        theArgs.push({
          name: 'b',
          args: args,
        });
      },
      undefined,
    );

    fn(4, 5, 6);

    expect(theArgs).toEqual([
      {
        name: 'a',
        args: [4, 5, 6],
      },
      {
        name: 'b',
        args: [4, 5, 6],
      },
    ]);
  });
});

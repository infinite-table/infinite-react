/**
 * Correctly infers non-nullable values
 *
 * @example
 * ```
 * const array: (string | null)[] = ['foo', 'bar', null, 'zoo', null];
 * const filteredArray: string[] = array.filter(notNullable);
 * ```
 *
 * from https://stackoverflow.com/a/46700791/7522735
 */
export function notNullable<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  if (value === null || value === undefined) return false;
  //@ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const testDummyForCompileError: TValue = value;
  return true;
}

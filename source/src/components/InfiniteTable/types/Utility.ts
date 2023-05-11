export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type MapOrRecord<K extends string, V> = Map<K, V> | Record<K, V>;

export type RequireOnlyOneProperty<T, Keys extends keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> &
      Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type DiscriminatedUnion<A, B> =
  | (A & {
      [K in keyof B]?: undefined;
    })
  | (B & {
      [K in keyof A]?: undefined;
    });

export type AllPropertiesOrNone<DATA_TYPE> =
  | DATA_TYPE
  | { [KEY in keyof DATA_TYPE]?: never };

export type KeyOfNoSymbol<T> = Exclude<keyof T, Symbol>;

export type KeysOf<T> = T extends any ? Record<keyof T, any> : never;

export type UPDATED_VALUES<T> = {
  [key in keyof T]?: {
    newValue: T[key];
    oldValue: T[key];
  };
};

/**
 * From `T` make a set of properties by key `K` become optional
 */
export type Optional<T extends object, K extends keyof T = keyof T> = Omit<
  T,
  K
> &
  Partial<Pick<T, K>>;

/**
 * From `T` make a set of properties by key `K` become required
 */
export type RequiredProp<T extends object, K extends keyof T = keyof T> = Omit<
  T,
  K
> &
  Required<Pick<T, K>>;

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

/**
 * Restrict using either exclusively the keys of T or exclusively the keys of U.
 *
 * No unique keys of T can be used simultaneously with any unique keys of U.
 *
 * @example
 *```
 * const myVar: XOR<T, U>
 *```
 *
 * @see https://github.com/maninak/ts-xor/tree/master#description
 */
export type XOR<T, U> = T | U extends object
  ? Prettify<Without<T, U> & U> | Prettify<Without<U, T> & T>
  : T | U;

/**
 * Useful if applying XOR on more than 2 types.
 * It comes with the penalty of having the types wrapped in an array
 *
 * @example
 * ```
 * AllXOR<[
 *   { a: AModule },
 *   { b: BModule },
 *   { c: CModule },
 *   { d: DModule }
 * ]>
 * ```
 * @see https://github.com/Microsoft/TypeScript/issues/14094#issuecomment-723571692
 */
export type AllXOR<T extends any[]> = T extends [infer Only]
  ? Only
  : T extends [infer A, infer B, ...infer Rest]
  ? AllXOR<[XOR<A, B>, ...Rest]>
  : never;

/**
 * Get the keys of T without any keys of U.
 */
export type Without<T, U> = {
  [P in Exclude<keyof T, keyof U>]?: never;
};

/**
 * Resolve mapped types and show the derived keys and their types when hovering in
 * IDEs, instead of just showing the names those mapped types are defined with.
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};

/**
 * Either a NonNullable value or undefined
 *
 * @see https://guide.elm-lang.org/error_handling/maybe.html
 */
export type Maybe<T> = NonNullable<T> | undefined;

export type WithId<T> = T & {
  id: string;
};

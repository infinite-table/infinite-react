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

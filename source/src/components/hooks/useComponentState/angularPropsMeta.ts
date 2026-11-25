/**
 * The metadata build/generate-angular-inputs.mts writes next to the
 * generated input classes of the Angular components: how their members map
 * back to the shared props (see useManagedComponent.angular.ts).
 */
export type AngularCallbackMeta =
  /** `onXChange` of a model prop: the model `x` is written (it emits `xChange`) */
  | { model: string; fn: boolean }
  /**
   * any other callback: the output is emitted with the first argument
   * (`first`), nothing (`none`) or the first argument with the DOM event of
   * the second one merged in (`merge-event`)
   */
  | {
      output: string;
      pack: 'none' | 'first' | 'merge-event';
      fn: boolean;
    };

export type AngularPropsMeta = {
  /** members read as they are (input signals) - the shared prop has the same name */
  inputs: readonly string[];
  /** model signals: the state props */
  models: readonly string[];
  /**
   * shared callback name -> how to deliver it. `fn`: there is also a function
   * input with the callback's name, called with all its arguments.
   */
  callbacks: Readonly<Record<string, AngularCallbackMeta>>;
};

/**
 * Input transform of the boolean props: the bare attribute
 * (`<infinite-table keyboardSelection>`) means true; not binding it keeps
 * `undefined`, which the shared code reads as "not specified".
 */
export function booleanInput<T>(value: T | ''): T | true {
  return value === '' ? true : value;
}

type KeysOfUnion<U> = U extends unknown ? keyof U : never;

/**
 * The props of a component whose prop type is (or includes) a discriminated
 * union - eg `selectionMode: 'multi-row'` with its `rowSelection` - as one
 * object type: every key of every member, with the union of their types.
 * Angular inputs are declared one by one, so the generated input classes
 * index this type.
 */
export type MergeUnion<U> = {
  [K in KeysOfUnion<U>]?: U extends unknown
    ? K extends keyof U
      ? U[K]
      : never
    : never;
};

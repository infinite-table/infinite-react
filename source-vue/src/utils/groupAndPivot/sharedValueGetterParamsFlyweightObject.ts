import { ValueGetterParams } from './types';

/**
 * We do this in order to ease the burden of creating new objects when grouping/pivoting
 *
 * So when iterating, instead of creating a new object, we reuse the same object
 */
export const sharedValueGetterParamsFlyweightObject = Object.seal({
  data: null,
  field: null,
}) as any as ValueGetterParams<any>;

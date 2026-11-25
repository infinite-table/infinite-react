import { getDefaultFilterTypes } from './defaultFilterTypesShared';

/**
 * Angular sibling of defaultFilterTypes: same filter functions/operators.
 *
 * The Angular filter editors and operator icons are wired in with the header
 * filters.
 */
export const defaultFilterTypes = getDefaultFilterTypes<any>({});

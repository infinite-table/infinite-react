// How a prop or a hook of the reference is named on the docs pages of a
// framework. The reference is written once, with the React names; Vue keeps
// them, Angular binds them differently: `sortInfo` is a model
// (`[(sortInfo)]`), `onSortInfoChange` is its `(sortInfoChange)` output,
// `onCellClick` is the `(cellClick)` output, and hooks are inject functions.
//
// The prop names come from source/angular-props.generated.json, which the
// Angular inputs generator writes (source/build/generate-angular-inputs.mts),
// so they follow the API. The hooks are mapped by hand below.
//
// Imported by Node scripts as well (scripts/generate-llms-docs.js), like
// docsFrameworksRegistry.ts: relative imports only, with their `.ts`
// extension, and no TypeScript syntax that needs transpiling.
import angularProps from '../../../source/angular-props.generated.json' with { type: 'json' };

import type { DocsFrameworkId } from './docsFrameworksRegistry.ts';

/** The components whose props the reference lists: `<PropLink>` and `<DPropLink>`. */
export type DocsPropsComponent = 'InfiniteTable' | 'DataSource';

/** How an Angular member is bound (source/angular-props.generated.json). */
type AngularPropKind =
  | 'input'
  | 'model'
  | 'model-change'
  | 'output'
  | 'function-input';

type AngularPropNames = Record<
  DocsPropsComponent,
  Record<string, { angularName: string; kind: AngularPropKind }[]>
>;

const ANGULAR_PROPS = angularProps as AngularPropNames;

/**
 * The React hooks of the reference (reference/hooks) and the Angular inject
 * functions that stand for them. Keep in sync with the Angular entry of the
 * library (source/src/index.angular.ts).
 */
export const ANGULAR_INJECT_FUNCTIONS: Record<string, string> = {
  useInfiniteColumnCell: 'injectColumnCell',
  useInfiniteHeaderCell: 'injectHeaderCell',
  useInfiniteColumnEditor: 'injectColumnEditor',
  useInfiniteColumnFilterEditor: 'injectColumnFilterEditor',
  useDataSourceState: 'injectDataSourceState',
  useMasterRowInfo: 'injectMasterRowInfo',
};

/** A reference name as a page of some framework shows it. */
export type DocsReferenceName = {
  /** `[(sortInfo)]`, `(sortInfoChange)`, `injectColumnCell` */
  label: string;
  /** What kind of member it is, when its form doesn't say it all: `model`. */
  chip?: string;
  /** The other names it has there, when there is more than one (the function input of a change callback). */
  more?: string[];
};

function angularLabel(angularName: string, kind: AngularPropKind) {
  switch (kind) {
    case 'model':
      return `[(${angularName})]`;
    case 'model-change':
    case 'output':
      return `(${angularName})`;
    case 'function-input':
      return `[${angularName}]`;
    default:
      return angularName;
  }
}

/**
 * The name of a prop of `component` on a page of `framework`, or `null` when
 * it's the React one (React and Vue pages, `default*` props, plain inputs,
 * column properties like `columns.renderValue`, props Angular doesn't have).
 */
export function docsPropName(
  framework: DocsFrameworkId,
  component: DocsPropsComponent,
  name: string,
): DocsReferenceName | null {
  if (framework !== 'angular') {
    return null;
  }
  const [first, ...rest] = ANGULAR_PROPS[component][name] ?? [];
  if (!first || (first.kind === 'input' && first.angularName === name)) {
    return null;
  }
  return {
    label: angularLabel(first.angularName, first.kind),
    chip: first.kind === 'model' ? 'model' : undefined,
    more: rest.length
      ? rest.map((member) => angularLabel(member.angularName, member.kind))
      : undefined,
  };
}

/** The name of a hook of the reference on a page of `framework`, or `null` when it's the React one. */
export function docsHookName(
  framework: DocsFrameworkId,
  name: string,
): DocsReferenceName | null {
  if (framework !== 'angular') {
    return null;
  }
  const injectFunction = ANGULAR_INJECT_FUNCTIONS[name];
  return injectFunction ? { label: injectFunction } : null;
}

/**
 * The Angular names a reference entry is also reachable at, as anchors next
 * to its own (`#onCellClick` and `#cellClick`).
 */
export function docsPropAnchors(
  framework: DocsFrameworkId,
  component: DocsPropsComponent,
  name: string,
): string[] {
  if (framework !== 'angular') {
    return [];
  }
  return [
    ...new Set(
      (ANGULAR_PROPS[component][name] ?? [])
        .map((member) => member.angularName)
        // not one that is a React name as well (there's an entry for it)
        .filter((angularName) => !(angularName in ANGULAR_PROPS[component])),
    ),
  ];
}

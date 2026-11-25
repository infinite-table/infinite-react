import {
  defineFrameworks,
  type FrameworksConfig,
} from '@thedatagrid/docs-kit/frameworks';

import {
  DOCS_DEFAULT_FRAMEWORK,
  DOCS_FALLBACK_NOTICE,
  DOCS_FRAMEWORK_IDS,
  DOCS_FRAMEWORKS_REGISTRY,
  docsFramework,
  type DocsFrameworkId,
} from './docsFrameworksRegistry';

export type { DocsFrameworkId };
export { DOCS_FALLBACK_NOTICE };

/** `{ react: …, vue: … }`: a value per framework of the registry. */
const perFramework = <T>(value: (id: DocsFrameworkId) => T) =>
  Object.fromEntries(DOCS_FRAMEWORK_IDS.map((id) => [id, value(id)])) as Record<
    DocsFrameworkId,
    T
  >;

/**
 * The docs exist once per framework (www/frameworks.json). React keeps
 * `/docs/...`; Vue lives under `/vue/docs/...`. Pages and links are written
 * once, in the React form, and mapped to the page's framework when the site
 * is built.
 */
export const DOCS_FRAMEWORKS_CONFIG: FrameworksConfig<DocsFrameworkId> = {
  default: DOCS_DEFAULT_FRAMEWORK,
  frameworks: perFramework((id) => ({
    label: docsFramework(id).label,
    prefix: docsFramework(id).prefix,
  })),
  roots: DOCS_FRAMEWORKS_REGISTRY.roots,
  storageKey: DOCS_FRAMEWORKS_REGISTRY.storageKey,
};

export const docsFrameworks = defineFrameworks(DOCS_FRAMEWORKS_CONFIG);

/** Each framework's home page: the site's homepage is the React one. */
export const DOCS_FRAMEWORK_HOME = perFramework((id) => docsFramework(id).home);

/** Each framework's npm package. */
export const DOCS_FRAMEWORK_PACKAGE = perFramework(
  (id) => docsFramework(id).package,
);

/** Neutral paths of the pages each framework has; a framework without a list has every page. */
export type DocsFrameworkPages = Partial<
  Record<DocsFrameworkId, readonly string[]>
>;

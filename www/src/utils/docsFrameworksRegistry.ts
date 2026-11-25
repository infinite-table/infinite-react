// The UI frameworks the docs are written for: www/frameworks.json, read here
// and nowhere else. What the site does per framework (URLs, home pages, the
// package name, demo and snippet siblings, demo manifests, the sitemap, the
// OG cards, the .md export) loops over this list.
//
// Imported by Node scripts (docs-kit.config.mjs, scripts/generate-llms-docs.js,
// scripts/check-pages.mjs) as well as by the site, so: relative imports only
// (with their `.ts` extension), and no TypeScript syntax that needs
// transpiling.
import registry from '../../frameworks.json' with { type: 'json' };

/** A framework the docs are written for: a key of `frameworks` in www/frameworks.json. */
export type DocsFrameworkId = keyof typeof registry.frameworks;

/** One entry of www/frameworks.json. */
export type DocsFrameworkEntry = {
  /** Shown in the switcher, the banner, notices, page titles and the OG cards. */
  label: string;
  /** URL prefix of its docs (`/vue/docs/...`): `''` for the default framework. */
  prefix: string;
  /** Its home page: `/` is the default framework's. */
  home: string;
  /** Its npm package. The docs name the default framework's; the other frameworks' pages show theirs. */
  package: string;
  /** Its demo files: a fence naming `x.demo.tsx` shows `x<demoSuffix>` on its pages. */
  demoSuffix: string;
  /** Its snippet files, in the order they're looked for. */
  snippetSuffixes: string[];
  /**
   * Where docs-kit builds its demos (`manifest.json` in there), relative to
   * www. docs-kit decides it: `outDir` for the default framework,
   * `<outDir>/_<id>` for the others (checked below).
   */
  demoOutDir: string;
  /** Where docs-kit forks its demos to (its FORK_TARGETS; docs-kit.config.mjs checks they agree). */
  fork: 'codesandbox' | 'stackblitz';
};

type DocsFrameworksRegistry = {
  /** Its URLs carry no prefix; the docs are written in its form. */
  default: DocsFrameworkId;
  /** Paths that exist once per framework. */
  roots: string[];
  /** `localStorage` key of the visitor's choice. */
  storageKey: string;
  frameworks: Record<DocsFrameworkId, DocsFrameworkEntry>;
};

export const DOCS_FRAMEWORKS_REGISTRY = registry as DocsFrameworksRegistry;

/** The framework whose docs have no prefix (`/docs/...`): React. */
export const DOCS_DEFAULT_FRAMEWORK = DOCS_FRAMEWORKS_REGISTRY.default;

/** Every framework, the default one first, the others in the registry's order. */
export const DOCS_FRAMEWORK_IDS: DocsFrameworkId[] = [
  DOCS_DEFAULT_FRAMEWORK,
  ...(
    Object.keys(DOCS_FRAMEWORKS_REGISTRY.frameworks) as DocsFrameworkId[]
  ).filter((id) => id !== DOCS_DEFAULT_FRAMEWORK),
];

export function docsFramework(id: DocsFrameworkId): DocsFrameworkEntry {
  return DOCS_FRAMEWORKS_REGISTRY.frameworks[id];
}

/** The ids, labels, prefixes and demo folders have to fit together; this fails the build when they don't. */
function checkRegistry() {
  const fail = (message: string): never => {
    throw new Error(`www/frameworks.json: ${message}`);
  };
  const defaultEntry =
    DOCS_FRAMEWORKS_REGISTRY.frameworks[DOCS_DEFAULT_FRAMEWORK];
  if (!defaultEntry) {
    fail(`the default framework "${DOCS_DEFAULT_FRAMEWORK}" has no entry`);
  }
  for (const id of DOCS_FRAMEWORK_IDS) {
    const entry = docsFramework(id);
    const isDefault = id === DOCS_DEFAULT_FRAMEWORK;
    if (
      isDefault ? entry.prefix !== '' : !/^\/[a-z0-9-]+$/.test(entry.prefix)
    ) {
      fail(
        `"${id}".prefix: ${
          isDefault ? "'' for the default framework" : 'a path like "/vue"'
        }`,
      );
    }
    const demoOutDir = isDefault
      ? defaultEntry.demoOutDir
      : `${defaultEntry.demoOutDir}/_${id}`;
    if (entry.demoOutDir !== demoOutDir) {
      fail(`"${id}".demoOutDir: docs-kit builds its demos into ${demoOutDir}`);
    }
  }
}
checkRegistry();

/**
 * On a page of `framework`, the files a fence naming a file of the default
 * framework shows instead: `x.demo.tsx` → `x.demo.vue`, `x.snippet.tsx` →
 * `x.snippet.vue` or `x.snippet.vue.ts` (the first that exists). For
 * remarkDemoFences `siblings` and the .md export; `undefined` for the default
 * framework.
 */
export function docsFrameworkSiblings(
  framework: DocsFrameworkId,
): Record<string, string[]> | undefined {
  if (framework === DOCS_DEFAULT_FRAMEWORK) {
    return undefined;
  }
  const from = docsFramework(DOCS_DEFAULT_FRAMEWORK);
  const to = docsFramework(framework);
  const siblings: Record<string, string[]> = {
    [from.demoSuffix]: [to.demoSuffix],
  };
  for (const suffix of from.snippetSuffixes) {
    siblings[suffix] = [...to.snippetSuffixes];
  }
  return siblings;
}

/**
 * Shown where a page, a link or a demo has no version for the page's
 * framework, and the default framework's one is shown instead: `React only
 * for now`.
 */
export const DOCS_FALLBACK_NOTICE = `${
  docsFramework(DOCS_DEFAULT_FRAMEWORK).label
} only for now`;

/** `React and Vue` (`React, Vue and Angular`): the frameworks, for a sentence. */
export function docsFrameworksText(
  labels: string[] = DOCS_FRAMEWORK_IDS.map((id) => docsFramework(id).label),
): string {
  return labels.length < 2
    ? labels.join('')
    : `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
}

import {
  defineFrameworks,
  type FrameworksConfig,
} from '@thedatagrid/docs-kit/frameworks';

import type { DocsFrameworkId } from './docsFrameworkPages';

export type { DocsFrameworkId };

/**
 * The docs exist once per framework. React keeps `/docs/...`; Vue lives under
 * `/vue/docs/...`. Pages and links are written once, in the React form, and
 * mapped to the page's framework when the site is built.
 */
export const DOCS_FRAMEWORKS_CONFIG: FrameworksConfig<DocsFrameworkId> = {
  default: 'react',
  frameworks: {
    react: { label: 'React', prefix: '' },
    vue: { label: 'Vue', prefix: '/vue' },
  },
  roots: ['/docs'],
  storageKey: 'infinite-docs-framework',
};

export const docsFrameworks = defineFrameworks(DOCS_FRAMEWORKS_CONFIG);

/** Each framework's home page: the site's homepage is the React one. */
export const DOCS_FRAMEWORK_HOME: Record<DocsFrameworkId, string> = {
  react: '/',
  vue: '/vue',
};

export const DOCS_FRAMEWORK_PACKAGE: Record<DocsFrameworkId, string> = {
  react: '@infinite-table/infinite-react',
  vue: '@infinite-table/infinite-vue',
};

/** Shown where a page, a link or a demo has no version for the page's framework. */
export const REACT_ONLY_NOTICE = 'React only for now';

/** Neutral paths of the pages each framework has; a framework without a list has every page. */
export type DocsFrameworkPages = Partial<
  Record<DocsFrameworkId, readonly string[]>
>;

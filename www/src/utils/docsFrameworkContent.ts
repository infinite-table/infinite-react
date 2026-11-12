// Server side: which docs pages exist per framework, from the content index.
import { splitHref, type HasPage } from '@thedatagrid/docs-kit/frameworks';

import { siteContent } from '../content';
import {
  frontmatterHasFramework,
  type DocsFrameworkId,
} from './docsFrameworkPages';
import {
  docsFrameworks,
  DOCS_FRAMEWORK_PACKAGE,
  type DocsFrameworkPages,
} from './docsFrameworks';
import type { MarkdownFileInfo } from './MarkdownFileInfo';

const normalize = (routePath: string) => splitHref(routePath)[0];

const docsPages = new Map<string, MarkdownFileInfo>();
for (const page of siteContent.routes) {
  const path = normalize(page.routePath);
  if (docsFrameworks.frameworkOf(path) != null) {
    docsPages.set(path, page);
  }
}

/** The page at a neutral docs path (`/docs/learn/sorting`), with or without a trailing slash. */
export function getDocsPage(neutralPath: string): MarkdownFileInfo | undefined {
  return docsPages.get(normalize(neutralPath));
}

/** Does the page exist, and is it written for this framework? */
export const docsHasPage: HasPage<DocsFrameworkId> = (
  neutralPath,
  framework,
) => {
  const page = getDocsPage(neutralPath);
  return !!page && frontmatterHasFramework(page.frontmatter, framework);
};

/** Neutral paths of a framework's pages, in content order. */
export function getDocsPagePaths(framework: DocsFrameworkId): string[] {
  return [...docsPages.entries()]
    .filter(([, page]) => frontmatterHasFramework(page.frontmatter, framework))
    .map(([path]) => path);
}

/**
 * What the client components get (the switcher, the banner): the list of Vue
 * pages. React has every page, so it needs no list - unless a page opts out
 * with `react: false`.
 */
export function getDocsFrameworkPages(): DocsFrameworkPages {
  const pages: DocsFrameworkPages = { vue: getDocsPagePaths('vue') };
  const react = getDocsPagePaths('react');
  if (react.length !== docsPages.size) {
    pages.react = react;
  }
  return pages;
}

/** `Vue DataGrid …` instead of `React DataGrid …`, and the Vue package name. */
export function textForFramework(text: string, framework: DocsFrameworkId) {
  if (framework === 'react') {
    return text;
  }
  return text
    .split(DOCS_FRAMEWORK_PACKAGE.react)
    .join(DOCS_FRAMEWORK_PACKAGE[framework])
    .replace(/\bReact\b/g, docsFrameworks.label(framework));
}

/** Title and description of a page for a framework: its own (`vue: { title, description }`), or the page's. */
export function getDocsPageMeta(
  page: MarkdownFileInfo | undefined,
  framework: DocsFrameworkId,
): { title?: string; description?: string } {
  const frontmatter = page?.frontmatter ?? {};
  const own =
    framework !== 'react' && typeof frontmatter[framework] === 'object'
      ? (frontmatter[framework] as { title?: string; description?: string })
      : {};
  const description: string | undefined =
    frontmatter.description ?? page?.excerpt ?? undefined;
  return {
    title: own.title ?? frontmatter.title,
    description:
      own.description ??
      (description ? textForFramework(description, framework) : undefined),
  };
}

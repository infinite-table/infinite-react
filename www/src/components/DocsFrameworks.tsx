'use client';

import {
  createHasPage,
  mapRouteTree,
  resolveFrameworkLink,
} from '@thedatagrid/docs-kit/frameworks';
import {
  FrameworkBanner,
  FrameworkLinks,
  FrameworkSwitcher,
} from '@thedatagrid/docs-kit/frameworks/react';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

import {
  docsFrameworks,
  DOCS_FRAMEWORK_HOME,
  DOCS_FRAMEWORKS_CONFIG,
  type DocsFrameworkId,
  type DocsFrameworkPages,
} from '@www/utils/docsFrameworks';

const PagesContext = React.createContext<DocsFrameworkPages>({});

/** Hands the list of pages each framework has (from the content index) to the components below. */
export function DocsFrameworksProvider(props: {
  pages: DocsFrameworkPages;
  children: React.ReactNode;
}) {
  return (
    <PagesContext.Provider value={props.pages}>
      {props.children}
    </PagesContext.Provider>
  );
}

/**
 * The framework of the page being shown (`null` outside the docs), and how to
 * point links and sidebar trees written in the React form at it.
 */
export function useDocsFramework() {
  const pages = React.useContext(PagesContext);
  const pathname = usePathname() || '';
  return React.useMemo(() => {
    const framework = docsFrameworks.frameworkOf(pathname);
    const hasPage = createHasPage<DocsFrameworkId>(pages);
    // a framework's landing page (/vue) links into that framework's docs
    const linkFramework =
      framework ??
      docsFrameworks.ids.find(
        (id) =>
          id !== docsFrameworks.default && DOCS_FRAMEWORK_HOME[id] === pathname,
      ) ??
      null;
    return {
      framework,
      /** The page's path in the React form: `/vue/docs/x` → `/docs/x`. */
      neutralPath: docsFrameworks.neutralPath(pathname),
      /** A docs link for this page's framework (the React page when there's no other). */
      hrefFor(href: string) {
        if (!linkFramework) {
          return href;
        }
        const link = resolveFrameworkLink(
          docsFrameworks,
          href,
          linkFramework,
          hasPage,
        );
        return link.kind === 'missing' ? href : link.href;
      },
      /** A sidebar tree for this page's framework. */
      routesFor<R extends { path?: string; routes?: R[] }>(routes: R[]): R[] {
        return framework && framework !== docsFrameworks.default
          ? mapRouteTree(docsFrameworks, routes, framework, hasPage, {
              onFallback: (route, fallback) => ({
                ...route,
                frameworkFallback: docsFrameworks.label(fallback),
              }),
            })
          : routes;
      },
    };
  }, [pages, pathname]);
}

/**
 * React | Vue. Each option links to the same page in that framework (or the
 * nearest parent that exists there) and remembers the choice.
 */
export function DocsFrameworkSwitcher(props: { className?: string }) {
  const pages = React.useContext(PagesContext);
  const pathname = usePathname();
  const router = useRouter();
  return (
    <FrameworkSwitcher
      config={DOCS_FRAMEWORKS_CONFIG}
      pages={pages}
      pathname={pathname}
      navigate={router.push}
      home={DOCS_FRAMEWORK_HOME}
      className={props.className}
    />
  );
}

/** "View this page for Vue" / "React only for now", when the page isn't in the visitor's framework. */
export function DocsFrameworkBanner(props: { className?: string }) {
  const pages = React.useContext(PagesContext);
  const pathname = usePathname();
  const router = useRouter();
  return (
    <FrameworkBanner
      config={DOCS_FRAMEWORKS_CONFIG}
      pages={pages}
      pathname={pathname}
      navigate={router.push}
      className={props.className}
    />
  );
}

/** Docs links follow the visitor's framework. Mounted once, in the layout. */
export function DocsFrameworkLinks() {
  const pages = React.useContext(PagesContext);
  const router = useRouter();
  return (
    <FrameworkLinks
      config={DOCS_FRAMEWORKS_CONFIG}
      pages={pages}
      navigate={router.push}
    />
  );
}

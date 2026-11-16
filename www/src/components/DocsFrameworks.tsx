'use client';

import {
  createHasPage,
  mapRouteTree,
  resolveFrameworkLink,
  resolveSwitchTarget,
} from '@thedatagrid/docs-kit/frameworks';
import {
  EXPLICIT_LINK_ATTRIBUTE,
  FrameworkBanner,
  FrameworkLinks,
  useFrameworkPreference,
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
 * React | Vue, in the site header.
 *
 * - On a docs page, each option links to the same page in that framework (or
 *   the nearest parent that exists there).
 * - On a home page (`/` is the React one, `/vue` the Vue one), to the other
 *   framework's home page.
 * - Anywhere else (blog, pricing) it only remembers the choice.
 *
 * The choice is stored, and docs links then follow it (`DocsFrameworkLinks`).
 */
export function DocsFrameworkSwitcher(props: { className?: string }) {
  const pages = React.useContext(PagesContext);
  const pathname = usePathname() || '';
  const router = useRouter();
  const [preference, setPreference] = useFrameworkPreference(docsFrameworks);
  const hasPage = React.useMemo(
    () => createHasPage<DocsFrameworkId>(pages),
    [pages],
  );

  const pageFramework = docsFrameworks.frameworkOf(pathname);
  const homeFramework =
    docsFrameworks.ids.find((id) => DOCS_FRAMEWORK_HOME[id] === pathname) ??
    null;
  const current =
    pageFramework ?? homeFramework ?? preference ?? docsFrameworks.default;

  return (
    <div
      className={`dk-framework-switcher docs-framework-switcher ${
        props.className ?? ''
      }`}
      role="group"
      aria-label="Framework"
    >
      {docsFrameworks.ids.map((id) => {
        let href: string | undefined;
        if (pageFramework) {
          href =
            resolveSwitchTarget(docsFrameworks, pathname, id, hasPage)?.href ??
            docsFrameworks.pathFor('/docs', id);
        } else if (homeFramework) {
          href = DOCS_FRAMEWORK_HOME[id];
        }
        const active = id === current;
        const className = `dk-framework-option${
          active ? ' dk-framework-option--active' : ''
        }`;
        const onClick = (event: React.MouseEvent<HTMLElement>) => {
          setPreference(id);
          const plainClick =
            event.button === 0 &&
            !event.metaKey &&
            !event.ctrlKey &&
            !event.shiftKey &&
            !event.altKey;
          if (!href || !plainClick) {
            return;
          }
          event.preventDefault();
          if (href !== pathname) {
            router.push(href);
          }
        };
        return href ? (
          <a
            key={id}
            href={href}
            className={className}
            data-framework={id}
            aria-current={active ? 'true' : undefined}
            onClick={onClick}
            // the visitor's stored framework must not rewrite the switcher's own links
            {...{ [EXPLICIT_LINK_ATTRIBUTE]: '' }}
          >
            {docsFrameworks.label(id)}
          </a>
        ) : (
          <button
            key={id}
            type="button"
            className={className}
            data-framework={id}
            aria-current={active ? 'true' : undefined}
            onClick={onClick}
          >
            {docsFrameworks.label(id)}
          </button>
        );
      })}
    </div>
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

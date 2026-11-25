'use client';

import {
  createHasPage,
  mapRouteTree,
  resolveFrameworkLink,
  resolveSwitchTarget,
} from '@thedatagrid/docs-kit/frameworks';
import {
  FrameworkBanner,
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
import { docsFramework } from '@www/utils/docsFrameworksRegistry';

const PagesContext = React.createContext<DocsFrameworkPages>({});

/** The framework whose home page this is (`/` is the React one, `/vue` the Vue one), or `null`. */
const homeFrameworkOf = (pathname: string): DocsFrameworkId | null =>
  docsFrameworks.ids.find((id) => DOCS_FRAMEWORK_HOME[id] === pathname) ??
  null;

/**
 * The framework the visitor is in: the page's (a docs page or a home page),
 * else the one they chose, else React. The switcher shows it as active and
 * the logo links to its home page.
 */
export function useCurrentDocsFramework(): DocsFrameworkId {
  const pathname = usePathname() || '';
  const [preference] = useFrameworkPreference(docsFrameworks);
  return (
    docsFrameworks.frameworkOf(pathname) ??
    homeFrameworkOf(pathname) ??
    preference ??
    docsFrameworks.default
  );
}

/** The home page of the framework the visitor is in. */
export function useDocsFrameworkHome(): string {
  return DOCS_FRAMEWORK_HOME[useCurrentDocsFramework()];
}

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
  const [preference] = useFrameworkPreference(docsFrameworks);
  return React.useMemo(() => {
    const framework = docsFrameworks.frameworkOf(pathname);
    const hasPage = createHasPage<DocsFrameworkId>(pages);
    // outside the docs: a home page links into its framework's docs (`/` is
    // the React one, `/vue` the Vue one), any other page (blog, pricing) into
    // the docs of the framework the visitor chose
    const linkFramework =
      framework ?? homeFrameworkOf(pathname) ?? preference ?? null;
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
  }, [pages, pathname, preference]);
}

/**
 * The current hash, for the same page in the `target` framework.
 *
 * Headings keep their ids across frameworks. A demo hash
 * (`#<demo-slug>/<file>`) names a file of that framework's demo: the main
 * file is mapped (`x.demo.tsx` ↔ `x.demo.vue`); for any other file only the
 * demo slug is kept, as the other framework's demo may not have that file
 * (and a demo only scrolls into view when the file is found).
 */
function hashFor(hash: string, target: DocsFrameworkId): string {
  const raw = hash.replace(/^#/, '');
  if (!raw) {
    return '';
  }
  const slash = raw.indexOf('/');
  if (slash < 0) {
    return `#${raw}`;
  }
  const slug = raw.slice(0, slash);
  const file = raw.slice(slash + 1);
  for (const id of docsFrameworks.ids) {
    const ext = docsFramework(id).demoSuffix;
    if (file.endsWith(ext)) {
      return `#${slug}/${file.slice(0, -ext.length)}${docsFramework(target).demoSuffix}`;
    }
  }
  return `#${slug}`;
}

/**
 * React | Vue (every framework of www/frameworks.json), in the site header.
 *
 * - On a docs page, each option links to the same page in that framework (or
 *   the nearest parent that exists there).
 * - On a home page (`/` is the React one, `/vue` the Vue one), to the other
 *   framework's home page.
 * - Anywhere else (blog, pricing) it only remembers the choice.
 *
 * The choice is stored: the banner on a docs page of another framework offers
 * the page in theirs, and links into the docs from the rest of the site
 * (`useDocsFramework().hrefFor`) go to their framework.
 */
export function DocsFrameworkSwitcher(props: { className?: string }) {
  const pages = React.useContext(PagesContext);
  const pathname = usePathname() || '';
  const router = useRouter();
  const [, setPreference] = useFrameworkPreference(docsFrameworks);
  const current = useCurrentDocsFramework();
  const hasPage = React.useMemo(
    () => createHasPage<DocsFrameworkId>(pages),
    [pages],
  );

  const pageFramework = docsFrameworks.frameworkOf(pathname);
  const homeFramework = homeFrameworkOf(pathname);

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
        // only when the same page exists in that framework: then the
        // current hash (heading, demo) is kept on switching
        let samePage = false;
        if (pageFramework) {
          const target = resolveSwitchTarget(
            docsFrameworks,
            pathname,
            id,
            hasPage,
          );
          samePage = !!target?.exact;
          href = target?.href ?? docsFrameworks.pathFor('/docs', id);
        } else if (homeFramework) {
          href = DOCS_FRAMEWORK_HOME[id];
        }
        const active = id === current;
        const className = `dk-framework-option${
          active ? ' dk-framework-option--active' : ''
        }`;
        const onClick = (event: React.MouseEvent<HTMLElement>) => {
          setPreference(id);
          // the hash is only known (and changes) on the client, so it's added
          // at click time - this covers cmd/middle clicks too, as the browser
          // reads the link's href after this handler
          const fullHref =
            href && samePage && id !== pageFramework
              ? `${href}${hashFor(window.location.hash, id)}`
              : href;
          if (fullHref && fullHref !== href) {
            event.currentTarget.setAttribute('href', fullHref);
          }
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
          if (href !== pathname && fullHref) {
            router.push(fullHref);
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

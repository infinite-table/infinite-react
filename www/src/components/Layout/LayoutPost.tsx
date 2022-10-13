import { MDXProvider } from '@mdx-js/react';
import recentPostsRouteTree from '@www/blogIndexRecent.json';
import { DocsPageFooter } from '@www/components/DocsFooter';
import { ExternalLink } from '@www/components/ExternalLink';
import { MDXComponents } from '@www/components/MDX/MDXComponents';
import { Seo } from '@www/components/Seo';
import { Toc } from '@www/components/Layout/Toc';
import format from 'date-fns/format';
import { useRouter } from 'next/router';
import * as React from 'react';
import { getAuthor } from '@www/utils/getAuthor';
import toCommaSeparatedList from '@www/utils/toCommaSeparatedList';
import { Page } from './Page';
import { RouteItem, useRouteMeta } from './useRouteMeta';
import { useTwitter } from './useTwitter';
import { getSidebarHome } from './getSidebarHome';

interface PageFrontmatter {
  id?: string;
  title: string;
  description?: string;
  author: string[];
  date?: string;
}

interface LayoutPostProps {
  /** Sidebar/Nav */
  routes: RouteItem[];
  /** Markdown frontmatter */
  meta: PageFrontmatter;
  /** The mdx */
  children: React.ReactNode;
}

function formatDate(date: Date | string) {
  return format(new Date(date), 'MMMM dd, yyyy');
}
/** Return the date of the current post given the path */
function getDateFromPath(path: string) {
  // All paths are /blog/year/month/day/title
  const [year, month, day] = path
    .substr(1) // first `/`
    .split('/') // make an array
    .slice(1) // ignore blog
    .map((i) => parseInt(i, 10)); // convert to numbers

  return {
    date: formatDate(new Date(year, month, day)),
    dateTime: [year, month, day].join('-'),
  };
}

function LayoutPost({ meta, children }: LayoutPostProps) {
  const { pathname } = useRouter();

  const { route, nextRoute, prevRoute } = useRouteMeta();
  if (!route) {
    return null;
  }
  //@ts-ignore
  const { date, dateTime } = route.date
    ? //@ts-ignore
      { date: formatDate(route.date), dateTime: route.date }
    : getDateFromPath(pathname);

  const anchors = React.Children.toArray(children)
    .filter(
      (child: any) =>
        child.props?.mdxType && ['h2', 'h3'].includes(child.props.mdxType),
    )
    .map((child: any) => ({
      url: '#' + child.props.id,
      depth: parseInt(child.props.mdxType.replace('h', ''), 0),
      text: child.props.children,
    }));
  useTwitter();
  return (
    <>
      <div className="w-full px-12">
        <div
          className="px-5 sm:px-12 h-full mx-auto relative overflow-x-hidden
        lg:pt-0 pt-20 lg:pl-80 2xl:px-80 "
        >
          <div className="max-w-4xl ml-0 2xl:mx-auto ">
            <Seo
              title={meta.title}
              description={`${
                meta.description || meta.title
              } | Infinite Table DataGrid for React`}
            />
            <div className=" ">
              <h1 className="mb-6 pt-8 text-4xl md:text-5xl font-bold leading-snug tracking-tight text-primary dark:text-primary-dark">
                {meta.title}
              </h1>
              <p className="mb-6 text-sm dark:text-secondary-dark">
                By{' '}
                {toCommaSeparatedList(meta.author, (author) => {
                  const url = getAuthor(author).url;

                  return <span key={url}>{getAuthor(author).name}</span>;
                  // return (
                  // <ExternalLink
                  //   key={url}
                  //   href={url}
                  //   className="text-link dark:text-link-dark underline font-bold">
                  //   {getAuthor(author).name}
                  // </ExternalLink>
                  // );
                })}
                <span className="mx-2">·</span>
                <span className="lead inline-flex text-gray-50">
                  <time dateTime={dateTime}>{date}</time>
                </span>
              </p>

              {/* @ts-ignore */}
              <MDXProvider components={MDXComponents}>{children}</MDXProvider>
            </div>
          </div>

          <DocsPageFooter
            route={route}
            nextRoute={nextRoute}
            prevRoute={prevRoute}
          />
        </div>
      </div>
      <div className="w-full lg:max-w-xs h-full hidden 2xl:block">
        <Toc headings={anchors} />
      </div>
    </>
  );
}

function AppShell(props: { children: React.ReactNode }) {
  const routeTree = getSidebarHome() as RouteItem;

  return <Page routeTree={routeTree} {...props} />;
}

export default function withLayoutPost(meta: any) {
  function LayoutPostWrapper(props: LayoutPostProps) {
    return <LayoutPost {...props} meta={meta} />;
  }

  LayoutPostWrapper.appShell = AppShell;
  LayoutPostWrapper.displayName = 'LayoutPostWrapper';

  return LayoutPostWrapper;
}

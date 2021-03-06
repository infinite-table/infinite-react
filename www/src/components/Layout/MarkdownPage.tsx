import * as React from 'react';
import { MDXProvider } from '@mdx-js/react';
import { DocsPageFooter } from '@www/components/DocsFooter';
import { MDXComponents } from '@www/components/MDX/MDXComponents';
import { Seo } from '@www/components/Seo';
import PageHeading from '@www/components/PageHeading';
import { useRouteMeta } from './useRouteMeta';
import { Toc } from './Toc';
export interface MarkdownProps<Frontmatter> {
  meta: Frontmatter & { description?: string };
  children?: React.ReactNode;
}

export function MaxWidth({ children }: { children: any }) {
  return (
    <div className="max-w-4xl ml-0 2xl:mx-auto">
      {children}
    </div>
  );
}

export function MarkdownPage<
  T extends { title: string; status?: string } = {
    title: string;
    status?: string;
  }
>({ children, meta }: MarkdownProps<T>) {
  const { route, nextRoute, prevRoute } = useRouteMeta();
  const title = meta.title || route?.title || '';
  const description =
    meta.description || route?.description || '';

  const propsAnchors = [];
  let anchors: Array<{
    url: string;
    text: React.ReactNode;
    depth: number;
  }> = React.Children.toArray(children)
    .filter((child: any) => {
      if (child.props?.mdxType) {
        return [
          'h1',
          'h2',
          'h3',
          'Challenges',
          'Recipes',
          'Recap',
          'PropTable',
        ].includes(child.props.mdxType);
      }
      return false;
    })
    .flatMap((child: any) => {
      if (child.props.mdxType === 'Challenges') {
        return {
          url: '#challenges',
          depth: 0,
          text: 'Challenges',
        };
      }
      if (child.props.mdxType === 'Recipes') {
        return {
          url: '#recipes',
          depth: 0,
          text: 'Recipes',
        };
      }
      if (child.props.mdxType === 'Recap') {
        return {
          url: '#recap',
          depth: 0,
          text: 'Recap',
        };
      }
      // if (child.props.mdxType === 'h') {
      //   debugger;
      //   return {
      //     url: '#recap',
      //     depth: 0,
      //     text: 'Recap',
      //   };
      // }
      console.log(child.props.mdxType);
      if (child.props.mdxType === 'PropTable') {
        return React.Children.toArray(child.props.children)
          .filter(
            (child: any) => child.props.mdxType === 'Prop'
          )
          .map((child: any) => {
            return {
              url: '#' + child.props.name,
              depth: 0,
              text: child.props.name,
            };
          });
      }

      let text = child.props.children;
      if (child.props?.mdxType.startsWith('h')) {
        const children = React.Children.toArray(
          child.props.children
        );
        text = children
          .map((child) => {
            if (!child) {
              return null;
            }
            if (
              typeof child === 'string' ||
              typeof child == 'number'
            ) {
              return child;
            }
            //@ts-ignore
            if (child.props?.mdxType) {
              //@ts-ignore
              return typeof child.props.children ===
                'string'
                ? //@ts-ignore
                  child.props.children
                : //@ts-ignore
                  child.props.name;
            }
          })
          .filter(Boolean)
          .join(' ');
      }
      return {
        url: '#' + child.props.id,
        depth:
          (child.props?.mdxType &&
            parseInt(
              child.props.mdxType.replace('h', ''),
              0
            )) ??
          0,
        text,
      };
    });
  if (anchors.length > 0) {
    anchors.unshift({
      depth: 1,
      text: 'Overview',
      url: '#',
    });
  }

  if (!route) {
    console.error(
      'This page was not added to one of the sidebar JSON files.'
    );
  }
  const isHomePage =
    route?.path === '/docs/latest' ||
    route?.path === '/docs';

  // Auto-wrap everything except a few types into
  // <MaxWidth> wrappers. Keep reusing the same
  // wrapper as long as we can until we meet
  // a full-width section which interrupts it.
  let fullWidthTypes = [
    'Sandpack',
    'APIAnatomy',
    'FullWidth',
    'PropTable',
    'Illustration',
    'IllustrationBlock',
    'Challenges',
    'Recipes',
  ];
  let wrapQueue: React.ReactNode[] = [];
  let finalChildren: React.ReactNode[] = [];
  function flushWrapper(key: string | number) {
    if (wrapQueue.length > 0) {
      finalChildren.push(
        <MaxWidth key={key}>{wrapQueue}</MaxWidth>
      );
      wrapQueue = [];
    }
  }
  function handleChild(child: any, key: string | number) {
    if (child == null) {
      return;
    }
    if (typeof child !== 'object') {
      wrapQueue.push(child);
      return;
    }
    if (fullWidthTypes.includes(child.props.mdxType)) {
      flushWrapper(key);
      finalChildren.push(child);
    } else {
      wrapQueue.push(child);
    }
  }
  React.Children.forEach(children, handleChild);
  flushWrapper('last');

  return (
    <article className="h-full mx-auto relative w-full min-w-0">
      <div className="lg:pt-0 pt-20 pl-0 lg:pl-80 2xl:px-80 ">
        <Seo title={title} description={description} />
        {!isHomePage && (
          <PageHeading title={title} tags={route?.tags} />
        )}
        <div className="px-5 sm:px-12">
          <div className="max-w-7xl mx-auto">
            <MDXProvider components={MDXComponents}>
              {finalChildren}
            </MDXProvider>
          </div>
          <DocsPageFooter
            route={route}
            nextRoute={nextRoute}
            prevRoute={prevRoute}
          />
        </div>
      </div>
      <div className="w-full lg:max-w-xs hidden 2xl:block">
        {!isHomePage && anchors.length > 0 && (
          <Toc headings={anchors} />
        )}
      </div>
    </article>
  );
}

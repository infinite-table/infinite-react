'use client';

import { DocsPageFooter, DocsPageRoute } from '@www/components/DocsFooter';

import cmpStyles from '@www/components/components.module.css';

import { useTwitter } from '@www/components/Layout/useTwitter';

import { MDXContent } from '@www/components/MDXContent';
import type { TocHeading } from '@www/utils/getMarkdownHeadings';
import { Toc } from '@www/components/Layout/Toc';

export function BlogPost({
  post,
  nextRoute,
  prevRoute,
  headings,
}: {
  headings: TocHeading[];
  post: {
    body: {
      code: string;
    };
    title: string;
    url: string;
    date: string;
    author: string;
  };
  nextRoute?: DocsPageRoute;
  prevRoute?: DocsPageRoute;
}) {
  const date = post.date;

  let author = post.author;
  if (Array.isArray(author)) {
    author = author[0];
  }

  /* eslint-disable react-hooks/rules-of-hooks */
  useTwitter();

  // getAnchors(post.body.code);

  return (
    <>
      <div className="w-full px-4 sm:px-12">
        <div className=" h-full mx-auto relative overflow-x-hidden lg:pt-0  lg:pl-80 2xl:px-80 ">
          <div className="ml-0 2xl:mx-auto 2xl:max-w-7xl">
            {/* <Seo
              title={post.title}
              draft={post.draft}
              description={`${
                post.description || post.title
              } | Infinite Table DataGrid for React`}
            /> TODO add this back */}
            <div className="leading-loose">
              <h1
                className={`mb-6 pt-8 inline-block text-4xl font-black md:text-5xl leading-snug tracking-tight text-content-color ${cmpStyles.HighlightBrandToLightBackground}`}
              >
                {post.title}
              </h1>
              <p className="mb-6 text-sm text-content-color">
                By {author}
                <span className="mx-2">·</span>
                <span className="lead inline-flex text-gray-50">
                  <time dateTime={post.date}>{date}</time>
                </span>
              </p>

              <MDXContent>{post.body.code}</MDXContent>
            </div>
          </div>

          <DocsPageFooter
            route={{
              title: post.title,
              path: post.url,
            }}
            nextRoute={nextRoute}
            prevRoute={prevRoute}
          />
        </div>
      </div>
      <div className="w-full lg:max-w-xs h-full hidden 2xl:block">
        <Toc headings={headings} />
      </div>
    </>
  );
}

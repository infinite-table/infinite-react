import Head from 'next/head';
import { withRouter, Router } from 'next/router';
import * as React from 'react';

export interface SeoProps {
  title: string;
  description?: string;
  image?: string;
  titleSuffix?: boolean;
  draft?: boolean;
  // jsonld?: JsonLDType | Array<JsonLDType>;
  children?: React.ReactNode;
}

export const Seo = withRouter(
  ({
    title,
    draft,
    titleSuffix = true,
    description,
    router,
    children,
  }: SeoProps & { router: Router }) => {
    if (titleSuffix) {
      title += ' | Infinite Table DataGrid for React';
    }
    description = description || title;
    return (
      <Head>
        {/* DEFAULT */}

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />

        {draft ? <meta name="robots" content="noindex" /> : null}
        {title != null && <title key="title">{title}</title>}
        {description != null && (
          <meta name="description" key="description" content={description} />
        )}
        {/* <link rel="icon" type="image/x-icon" href={favicon} />
      <link rel="apple-touch-icon" href={favicon} />  @todo favicon */}
        <link
          rel="icon shortcut"
          type="image/x-icon"
          href="/favicon.ico"
        ></link>

        {/* OPEN GRAPH */}
        <meta
          property="og:image"
          content="https://infinite-table.com/full-demo-image.png"
        />

        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="680" />
        <meta property="og:type" key="og:type" content="website" />
        <meta
          property="og:url"
          key="og:url"
          content={`https://infinite-table.com${
            router.pathname === '/' ? '' : router.pathname
          }`}
        />
        <link
          rel="canonical"
          href={`https://infinite-table.com${
            router.pathname === '/' ? '' : router.pathname
          }`}
        />
        {title != null && (
          <meta
            property="og:title"
            content={title || 'Infinite Table for React'}
            key="og:title"
          />
        )}
        {description != null && (
          <meta
            property="og:description"
            key="og:description"
            content={description}
          />
        )}
        {/* 
      <meta
        property="og:image"
        key="og:image"
        content={`https://beta.reactjs.org${image}`}
      /> */}

        {/* TWITTER */}
        {/* <meta
        name="twitter:card"
        key="twitter:card"
        content="summary_large_image"
      /> */}
        {/* <meta
        name="twitter:site"
        key="twitter:site"
        content="@reactjs"
      />
      <meta
        name="twitter:creator"
        key="twitter:creator"
        content="@reactjs"
      /> */}
        {title != null && (
          <meta name="twitter:title" key="twitter:title" content={title} />
        )}
        {description != null && (
          <meta
            name="twitter:description"
            key="twitter:description"
            content={description}
          />
        )}

        {/* <meta
        name="twitter:image"
        key="twitter:image"
        content={`https://beta.reactjs.org${image}`}
      /> */}

        {children}
      </Head>
    );
  },
);

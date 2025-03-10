'use client';
import Link from 'next/link';
import * as React from 'react';
import { ReactNode } from 'react';

import { BannerText } from './BannerText';

import cmpStyles from './components.module.css';

const titleOpacity = 'opacity-80';
const subtitleOpacity = 'opacity-70';

export const Card = ({
  href,
  title,
  children,
  className,
  style,
  noBackground,
  noBackgroundOnHover,
  flexContent,
  tag,
}: {
  flexContent?: boolean;
  href?: string;
  tag?: string;
  className?: string;
  style?: React.CSSProperties;
  title: ReactNode;
  children: ReactNode;
  noBackground?: boolean;
  noBackgroundOnHover?: boolean;
}) => {
  const Tag: string = tag || 'a';
  let cls = `${className || ''} ${
    cmpStyles.card
  } p-4 sm:p-4 md:p-8 py-10 rounded-sm flex flex-col`;

  if (!noBackgroundOnHover) {
    cls += `  hover:bg-deep-dark/90 `;
  }

  if (!noBackground) {
    cls += ` bg-deep-dark/60 `;
  }

  let header = (
    <>
      {title} {href && !href.startsWith('#') ? <>&rarr;</> : null}
    </>
  );

  const pageSection = !!href && href.startsWith('#');
  if (href && Tag != 'a') {
    header = <Link href={href}>{header}</Link>;
  }
  const content = (
    <>
      <h3
        className={`${titleOpacity} text-2xl font-light mb-4`}
        id={pageSection ? href.substring(1) : undefined}
        style={{
          marginTop: -30,
          paddingTop: 30,
        }}
      >
        {header}
      </h3>
      <div
        className={`${subtitleOpacity} text-md flex-1 ${
          flexContent ? 'inline-flex flex-col' : ''
        } leading-relaxed`}
      >
        {children}
      </div>
    </>
  );

  if (!href) {
    return (
      <div className={cls} style={style}>
        {content}
      </div>
    );
  }

  if (pageSection) {
    return (
      <a href={href} className={cls} style={style}>
        {/* @ts-ignore */}
        {content}
      </a>
    );
  }
  return (
    <Link href={href} legacyBehavior>
      {/* @ts-ignore */}
      <Tag className={cls} style={style}>
        {content}
      </Tag>
    </Link>
  );
};

const defaultTitle = (
  <>
    Built for{' '}
    <BannerText
      contents={['React', 'speed', 'React', 'speed']} // was intently duplicated
      timeout={8000}
      className={'text-glow'}
    />{' '}
    from the ground-up
  </>
);

const defaultChildren = (
  <>
    <Card title="📃 Documentation" href="/docs">
      Check out our in-depth documentation.
    </Card>

    <Card title="🔎 Examples" href="/docs/learn/getting-started">
      Discover practical examples to help you get started
    </Card>

    <Card title="📢 Blog" href="/blog">
      Read our articles to help you get the most of the Infinite Table
    </Card>

    <Card title="🧪 API Reference" href="/docs/reference">
      Thorough documentation for all API properties, with examples
    </Card>
  </>
);

const commonCls = `leading-relaxed text-center`;

export const CardsTitle = ({
  children,
  className,
  style,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <h3
      id={id}
      className={`${
        className || ''
      } ${commonCls} text-3xl font-bold ${titleOpacity}`}
      style={style}
    >
      {children}
    </h3>
  );
};

export const CardsSubtitle = (props: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?:
    | React.FunctionComponent<
        { children?: ReactNode } & React.HTMLProps<HTMLDivElement>
      >
    | string;
}) => {
  const Cmp = props.as || 'h4';
  const { children, className, style } = props;
  return (
    <Cmp
      className={`${commonCls} text-xl ${subtitleOpacity} ${className || ''}`}
      style={style}
    >
      {children}
    </Cmp>
  );
};
export const Cards = ({
  title,
  subtitle,
  children,
  spotlight = true,
  style,
}: {
  title?: ReactNode;
  style?: React.CSSProperties;
  subtitle?: ReactNode;
  children?: ReactNode;
  spotlight?: boolean;
}) => {
  const before = (
    <>
      {spotlight ? (
        <div
          style={{ position: 'absolute', inset: 0 }}
          className={`${cmpStyles.SpotlightRadialBackgroundCls}`}
        ></div>
      ) : null}

      <CardsTitle>{title ?? defaultTitle}</CardsTitle>

      {subtitle ? <CardsSubtitle as="h4">{subtitle}</CardsSubtitle> : null}
    </>
  );
  return (
    <CardsLayout style={style} before={before}>
      {children ?? defaultChildren}
    </CardsLayout>
  );
};

export const CardsLayout = ({
  before,

  children,
  style,
}: {
  before?: ReactNode;
  children: ReactNode;
  style?: React.CSSProperties;
}) => {
  return (
    <div className={`mt-24 relative w-full`} style={style}>
      {before}
      <div style={{ margin: '0 auto' }} className="justify-center flex w-full">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 my-16 w-full`}>
          {children}
        </div>
      </div>
    </div>
  );
};

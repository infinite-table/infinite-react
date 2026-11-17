'use client';
import Link from 'next/link';
import * as React from 'react';
import { ReactNode } from 'react';

import { BannerText } from './BannerText';

export const Card = ({
  href,
  title,
  children,
  className,
  style,
  noBackground,
  flexContent,
  tag,
}: {
  flexContent?: boolean;
  href?: string;
  /** `div` for a card with links inside: only its title is a link then */
  tag?: string;
  className?: string;
  style?: React.CSSProperties;
  title: ReactNode;
  children: ReactNode;
  noBackground?: boolean;
  noBackgroundOnHover?: boolean;
}) => {
  const Tag = (tag || 'a') as 'a' | 'div';
  const cls = `site-card ${noBackground ? 'site-card--plain' : ''} ${
    className || ''
  }`;

  const pageSection = !!href && href.startsWith('#');
  const arrow = href && !pageSection ? <> →</> : null;
  // the whole card is a link, unless it has links of its own (tag="div"):
  // a link can't hold another link
  const wholeCardIsLink = !!href && Tag === 'a';

  const header =
    href && !wholeCardIsLink ? (
      pageSection ? (
        <a href={href}>
          {title}
          {arrow}
        </a>
      ) : (
        <Link href={href}>
          {title}
          {arrow}
        </Link>
      )
    ) : (
      <>
        {title}
        {arrow}
      </>
    );

  const content = (
    <>
      {title ? (
        <h3
          className="site-card__title"
          id={pageSection ? href!.substring(1) : undefined}
        >
          {header}
        </h3>
      ) : null}
      <div
        className={`site-card__body ${
          flexContent ? 'inline-flex flex-col' : ''
        }`}
      >
        {children}
      </div>
    </>
  );

  if (!wholeCardIsLink) {
    return (
      <div className={cls} style={style}>
        {content}
      </div>
    );
  }

  if (pageSection) {
    return (
      <a href={href} className={`${cls} site-card--link`} style={style}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href!} className={`${cls} site-card--link`} style={style}>
      {content}
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
      className={`site-cards__title ${className || ''}`}
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
    <Cmp className={`site-cards__subtitle ${className || ''}`} style={style}>
      {children}
    </Cmp>
  );
};
export const Cards = ({
  title,
  subtitle,
  children,
  // no longer drawn; kept so callers still type-check
  spotlight: _spotlight,
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
    <div className="site-cards" style={style}>
      {before}
      <div className="site-cards__grid">{children}</div>
    </div>
  );
};

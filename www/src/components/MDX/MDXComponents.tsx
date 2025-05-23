'use client';
import ButtonLink from '@www/components/ButtonLink';
import * as React from 'react';
import { AccentButton } from '../AccentButton';
import { IconCodeBlock } from '../Icon/IconCodeBlock';

import { IconNavArrow } from '../Icon/IconNavArrow';
import { IconOpenInWindow } from '../Icon/IconOpenInWindow';

import { APIAnatomy, AnatomyStep } from './APIAnatomy';
import { Blockquote } from './Blockquote';
import { Challenges, /*Hint, */ Solution } from './Challenges';
import CodeBlock from './CodeBlock';
import { CodeDiagram } from './CodeDiagram';
import ConsoleBlock from './ConsoleBlock';
import Convention from './Convention';
import ExpandableCallout from './ExpandableCallout';
import ExpandableExample from './ExpandableExample';
import { H1, H2, H3, H4 } from './Heading';
import HeroCards from './HeroCards';
import HomepageHero from './HomepageHero';
import InlineCode from './InlineCode';
import Intro from './Intro';
import Link from './Link';
import { PackageImport } from './PackageImport';
import {
  Prop,
  PropTable,
  PropLink,
  TypeLink,
  LearnLink,
  DataSourcePropLink,
  ColumnApiLink,
  HookLink,
  DApiLink,
  TreeApiLink,
  ApiLink,
  CellApiLink,
  RowDetailApiLink,
  KeyNavApiLink,
} from './Prop';
import Recap from './Recap';
import Sandpack from './Sandpack';
import SimpleCallout from './SimpleCallout';
import TerminalBlock from './TerminalBlock';
import YouWillLearnCard from './YouWillLearnCard';

const P = (p: React.JSX.IntrinsicElements['p']) => (
  <p className="whitespace-pre-wrap my-4" {...p} />
);

const Strong = (strong: React.JSX.IntrinsicElements['strong']) => (
  <strong className="font-bold" {...strong} />
);

const OL = (p: React.JSX.IntrinsicElements['ol']) => (
  <ol className="ml-6 my-3 list-decimal" {...p} />
);
const LI = (p: React.JSX.IntrinsicElements['li']) => (
  <li className="leading-relaxed mb-1" {...p} />
);
const UL = (p: React.JSX.IntrinsicElements['ul']) => (
  <ul className="ml-6 my-3 list-disc" {...p} />
);

const Divider = () => <hr className="my-6 block border-b" />;

const Gotcha = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: React.ReactNode;
}) => (
  <ExpandableCallout type="gotcha" title={title ?? 'Gotcha'}>
    {children}
  </ExpandableCallout>
);
const Note = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: React.ReactNode;
}) => (
  <ExpandableCallout type="note" title={title}>
    {children}
  </ExpandableCallout>
);

const ReadMore = ({ children }: { children: React.ReactNode }) => (
  <ExpandableCallout type="readMore">{children}</ExpandableCallout>
);

function LearnMore({
  children,
  path,
}: {
  title: string;
  path?: string;
  children: any;
}) {
  return (
    <>
      <section className="p-8 mt-16 mb-16 flex flex-row shadow-inner justify-between items-center bg-card-dark rounded-lg">
        <div className="flex-col">
          <h2 className="text-primary-dark font-bold text-2xl leading-tight">
            Ready to learn this topic?
          </h2>
          {children}
          {path ? (
            <ButtonLink
              className="mt-1"
              label="Read More"
              href={path}
              type="primary"
            >
              Read More
              <IconNavArrow displayDirection="right" className="inline ml-1" />
            </ButtonLink>
          ) : null}
        </div>
      </section>
      <hr className="border-border-dark mb-14" />
    </>
  );
}

function Math({ children }: { children: any }) {
  return (
    <span
      style={{
        fontFamily: 'STIXGeneral-Regular, Georgia, serif',
        fontSize: '1.2rem',
      }}
    >
      {children}
    </span>
  );
}

function MathI({ children }: { children: any }) {
  return (
    <span
      style={{
        fontFamily: 'STIXGeneral-Italic, Georgia, serif',
        fontSize: '1.2rem',
      }}
    >
      {children}
    </span>
  );
}

function YouWillLearn({ children }: { children: any }) {
  return <SimpleCallout title="You will learn">{children}</SimpleCallout>;
}

// TODO: typing.
function Recipes(props: any) {
  return <Challenges {...props} isRecipes={true} />;
}

function AuthorCredit({
  author,
  authorLink,
}: {
  author: string;
  authorLink: string;
}) {
  return (
    <p className="text-center text-secondary-dark text-base mt-2">
      <cite>
        Illustrated by{' '}
        {authorLink ? (
          <a className="text-link" href={authorLink}>
            {author}
          </a>
        ) : (
          author
        )}
      </cite>
    </p>
  );
}

function Illustration({
  caption,
  src,
  alt,
  author,
  authorLink,
}: {
  caption: string;
  src: string;
  alt: string;
  author: string;
  authorLink: string;
  children: any;
}) {
  return (
    <div className="my-16 mx-0 2xl:mx-auto max-w-4xl 2xl:max-w-6xl">
      <figure className="my-8 flex justify-center">
        <img src={src} alt={alt} style={{ maxHeight: 300 }} />
        {caption ? (
          <figcaption className="text-center leading-tight mt-4">
            {caption}
          </figcaption>
        ) : null}
      </figure>
      {author ? <AuthorCredit author={author} authorLink={authorLink} /> : null}
    </div>
  );
}

function IllustrationBlock({
  title,
  sequential,
  author,
  authorLink,
  children,
}: {
  title: string;
  author: string;
  authorLink: string;
  sequential: boolean;
  children: any;
}) {
  const imageInfos = React.Children.toArray(children).map(
    (child: any) => child.props,
  );
  const images = imageInfos.map((info, index) => (
    <figure key={index}>
      <div className="flex-1 flex p-0 xl:px-6 justify-center items-center my-4">
        <img src={info.src} alt={info.alt} height={info.height} />
      </div>
      {info.caption ? (
        <figcaption className="text-secondary-dark text-center leading-tight mt-4">
          {info.caption}
        </figcaption>
      ) : null}
    </figure>
  ));
  return (
    <div className="my-16 mx-0 2xl:mx-auto max-w-4xl 2xl:max-w-6xl">
      {title ? (
        <h3 className="text-center text-xl font-bold leading-9 mb-4">
          {title}
        </h3>
      ) : null}
      {sequential ? (
        <ol className="mdx-illustration-block flex">
          {images.map((x: any, i: number) => (
            <li className="flex-1" key={i}>
              {x}
            </li>
          ))}
        </ol>
      ) : (
        <div className="mdx-illustration-block">{images}</div>
      )}
      {author ? <AuthorCredit author={author} authorLink={authorLink} /> : null}
      {/* @ts-ignore */}
      <style jsx global>{`
        .mdx-illustration-block {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          justify-content: center;
          align-content: stretch;
          align-items: stretch;
          gap: 42px;
        }
        ol.mdx-illustration-block {
          gap: 60px;
        }
        .mdx-illustration-block li {
          display: flex;
          align-items: flex-start;
          align-content: stretch;
          justify-content: space-around;
          position: relative;
          padding: 1rem;
        }
        .mdx-illustration-block figure {
          display: flex;
          flex-direction: column;
          align-content: center;
          align-items: center;

          justify-content: space-between;
          position: relative;
          height: 100%;
        }
        .mdx-illustration-block li:after {
          content: ' ';
          display: block;
          position: absolute;
          top: 50%;
          right: 100%;
          transform: translateY(-50%);
          width: 60px;
          height: 49px;
          background: center / contain no-repeat url('/images/g_arrow.png');
        }
        .mdx-illustration-block li:first-child:after {
          content: ' ';
          display: none;
        }
        .mdx-illustration-block img {
          max-height: 250px;
          width: 100%;
        }
        @media (max-width: 680px) {
          .mdx-illustration-block {
            flex-direction: column;
          }
          .mdx-illustration-block img {
            max-height: 200px;
          }
          .mdx-illustration-block li:after {
            top: 0;
            left: 50%;
            right: auto;
            transform: translateX(-50%) translateY(-100%) rotate(90deg);
          }
        }
      `}</style>
    </div>
  );
}

const Hint = ({
  children,
  title,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <ExpandableCallout type="hint" title={title || 'Hint'}>
    {children}
  </ExpandableCallout>
);

const isSandpackDescriptionElement = (el: React.ReactElement) => {
  //@ts-ignore
  return el.type?.name === 'Description';
};

type SizeOption = 'default' | 'md' | 'lg';
function CodeSandboxEmbed({
  src,
  id,
  children,
  title,
  code,
  size,
}: ({ src: string; id?: string } | { src?: string; id: string }) & {
  children?: React.ReactNode;
  title?: React.ReactNode;
  size?: SizeOption;
  code?: false | number;
}) {
  src =
    src ||
    `https://codesandbox.io/embed/${id}?fontsize=14&hidenavigation=1&module=%2FApp.tsx&theme=dark&editorsize=${
      code === false ? 0 : typeof code === 'number' ? code : 50
    }`;

  const theChildren = React.Children.toArray(
    //@ts-ignore
    children,
  ) as React.ReactElement[];

  const description = theChildren.find(isSandpackDescriptionElement);

  const descriptionBlock = description ? (
    <div className={'leading-base w-full bg-black/20 border-gray-60'}>
      <div className="sandpackDescription text-content-color text-base px-4 py-0.5 relative">
        {description}
      </div>
    </div>
  ) : null;

  const height = size === 'default' || !size ? 500 : size === 'md' ? 650 : 850;
  const frame = (
    <iframe
      src={src}
      style={{
        width: '100%',
        height,
        border: 0,
        borderRadius: 4,
        overflow: 'hidden',
      }}
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
    />
  );

  const titleBlock = title ? (
    <div className={'leading-base w-full '}>
      <div className="text-content-color flex text-base px-4 py-0.5 relative">
        <IconCodeBlock className="inline-flex mr-2 self-center" /> {title}
      </div>
    </div>
  ) : null;

  return descriptionBlock || titleBlock ? (
    <div className="bg-csdark rounded-lg">
      {titleBlock}
      {descriptionBlock}
      {frame}
    </div>
  ) : (
    frame
  );
}

export const MDXComponents = {
  p: P,
  strong: Strong,
  blockquote: Blockquote,
  ol: OL,
  ul: UL,
  li: LI,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  inlineCode: InlineCode,
  hr: Divider,
  a: Link,
  code: (props: any) => {
    if (typeof props.children === 'string' && !props.children.includes('\n')) {
      return <InlineCode {...props} />;
    }

    return <CodeBlock {...props} />;
  },
  // The code block renders <pre> so we just want a div here.
  pre: (p: React.JSX.IntrinsicElements['div']) => {
    return <div {...p} />;
  },
  // Scary: dynamic(() => import('./Scary')),
  APIAnatomy,
  AnatomyStep,
  CodeDiagram,
  ConsoleBlock,
  Convention,
  DeepDive: (props: {
    children: React.ReactNode;
    title: string;
    excerpt: string;
  }) => <ExpandableExample {...props} type="DeepDive" />,
  ExpandableDescription: (props: {
    children: React.ReactNode;
    title: string;
    excerpt: string;
  }) => <ExpandableExample {...props} type="ExpandableDescription" />,
  Gotcha,
  HomepageHero,
  HeroCards,
  Illustration,
  IllustrationBlock,
  Intro,
  IconOpenInWindow,
  Description: (props: { children: React.ReactNode }) => <>{props.children}</>,
  LearnMore,
  Math,
  MathI,
  Note,
  ReadMore,
  PackageImport,
  Prop,
  PropLink,
  TypeLink,
  LearnLink,
  AccentButton,
  DataSourcePropLink,
  DPropLink: DataSourcePropLink,
  DApiLink,
  TreeApiLink,
  ApiLink,
  HookLink,
  KeyNavApiLink,
  ColumnApiLink,
  CellApiLink,
  RowDetailApiLink,
  PropTable,
  Recap,
  Recipes,
  Sandpack,
  TerminalBlock,
  YouWillLearn,
  YouWillLearnCard,
  Challenges,
  Hint,
  Solution,
  YTEmbed: ({ url, code }: { url?: string; code?: string }) => {
    url = url || `https://www.youtube.com/embed/${code}`;
    return (
      <iframe
        width="100%"
        style={{
          aspectRatio: '16/9',
        }}
        src={url}
        className="max-w-4xl m-auto"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  },

  CodeSandboxEmbed,
  CSEmbed: CodeSandboxEmbed,
};

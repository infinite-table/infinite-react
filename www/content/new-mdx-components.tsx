import * as React from 'react';

import type { MDXComponents } from 'mdx/types';

import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
} from '@www/components/Heading';
import { TextGlow } from '@www/components/TextGlow';
import { Paragraph } from '@www/components/Paragraph';

// import { DocsLink } from '@www/components/DocsLink';
import { CodeSnippet } from '@www/components/CodeSnippet';

import { MarkdownFileInfo } from '@www/utils/MarkdownFileInfo';
import { LI, UnorderedList } from '@www/components/UnorderedList';
import { Blockquote } from '@www/components/Blockquote';

import HomepageHero from '@www/components/MDX/HomepageHero';
import TerminalBlock from '../src/components/MDX/TerminalBlock';
import { BenchmarkChart } from '../src/components/MDX/BenchmarkChart';

import Intro from '../src/components/MDX/Intro';
import HeroCards from '../src/components/MDX/HeroCards';
import {
  Illustration,
  IllustrationBlock,
} from '../src/components/Illustration';
import YouWillLearnCard from '../src/components/MDX/YouWillLearnCard';
import { Note } from '../src/components/Note';
import { CSEmbed } from '../src/components/CSEmbed';
import {
  ApiLink,
  HookLink,
  DApiLink,
  DataSourcePropLink,
  PropTable,
  LearnLink,
  Prop,
  PropLink,
  TreeApiLink,
  TypeLink,
  KeyNavApiLink,
  ColumnApiLink,
  CellApiLink,
  RowDetailApiLink,
} from '../src/components/MDX/Prop';
import { DocsLink } from '../src/components/DocsLink';
import { createDemoComponents } from '@thedatagrid/docs-kit/react';
import { createFrameworkContent } from '@thedatagrid/docs-kit/frameworks/react';
import { resolveFrameworkLink } from '@thedatagrid/docs-kit/frameworks';
import {
  DOCS_CODE_THEMES,
  DOCS_CONTENT_DIR,
  DOCS_DEMO_ANCHOR_PREFIX,
  DOCS_DEMO_HEIGHTS,
  DOCS_DEMO_MANIFEST,
  DOCS_DEMO_MANIFEST_VUE,
} from '../src/utils/docsKit';
import { docsHasPage } from '../src/utils/docsFrameworkContent';
import {
  docsFrameworks,
  REACT_ONLY_NOTICE,
  type DocsFrameworkId,
} from '../src/utils/docsFrameworks';
// import { Note } from '@www/components/Note';

type IgnoreChildrenCmpProps = { className?: string; children: React.ReactNode };
const IgnoreChildren = (Cmp: React.FC<IgnoreChildrenCmpProps>) => {
  return (props: IgnoreChildrenCmpProps) => {
    // @ts-ignore
    const p = React.Children.toArray(props.children)[0].props;
    return (
      <Cmp className={props.className}>{p ? p.children : props.children}</Cmp>
    );
  };
};

const Description = (props: { children: React.ReactNode }) => (
  <>{props.children}</>
);

/** On a page of another framework: this demo, snippet or link has no version for it yet. */
const ReactOnlyNotice = () => (
  <span className="docs-framework-notice">{REACT_ONLY_NOTICE}</span>
);

export function useMDXComponents(
  fileInfo: MarkdownFileInfo,
  framework: DocsFrameworkId = docsFrameworks.default,
): MDXComponents {
  const otherFramework = framework !== docsFrameworks.default;

  /** A docs link built by a component, for the page's framework. */
  const linkFor = (href: string) => {
    const link = resolveFrameworkLink(
      docsFrameworks,
      href,
      framework,
      docsHasPage,
    );
    return link.kind === 'missing' ? href : link.href;
  };

  const components: MDXComponents = {
    // <Demo>, <DemoTitle>, <DemoDescription> (see renderMarkdownPage)
    ...createDemoComponents({
      contentDir: DOCS_CONTENT_DIR,
      folder: fileInfo.folderPath,
      manifest:
        framework === 'vue' ? DOCS_DEMO_MANIFEST_VUE : DOCS_DEMO_MANIFEST,
      heights: DOCS_DEMO_HEIGHTS,
      themes: DOCS_CODE_THEMES,
      anchorPrefix: DOCS_DEMO_ANCHOR_PREFIX,
      // a demo or snippet without a Vue sibling: the React one, with a notice
      fallback: otherFramework
        ? { manifest: DOCS_DEMO_MANIFEST, notice: REACT_ONLY_NOTICE }
        : undefined,
    }),
    // <FrameworkContent framework="vue"> … </FrameworkContent>
    FrameworkContent: createFrameworkContent(framework),
    HomepageHero: () => <HomepageHero linkFor={linkFor} />,
    TerminalBlock,
    BenchmarkChart,
    HeroCards,
    Illustration,
    IllustrationBlock,
    // `frameworkFallback` is set by the link plugin when `path` has no page for this framework
    YouWillLearnCard: ({
      frameworkFallback,
      ...props
    }: React.ComponentProps<typeof YouWillLearnCard> & {
      frameworkFallback?: string;
    }) => (
      <YouWillLearnCard
        {...props}
        notice={frameworkFallback ? <ReactOnlyNotice /> : undefined}
      />
    ),
    Description,
    Intro,
    Note,

    // ...CurrentMDXComponents,
    //@ts-ignore
    h1: Heading1,
    // @ts-ignore
    h2: Heading2,
    // @ts-ignore
    h3: Heading3,
    // @ts-ignore
    h4: Heading4,
    // @ts-ignore
    h5: Heading5,
    // @ts-ignore
    h6: Heading6,

    Heading1: IgnoreChildren(Heading1),
    Heading2: IgnoreChildren(Heading2),
    Heading3: IgnoreChildren(Heading3),
    Heading4: IgnoreChildren(Heading4),
    Heading5: IgnoreChildren(Heading5),
    Heading6: IgnoreChildren(Heading6),

    // @ts-ignore
    a: DocsLink,

    TextGlow,

    ul: UnorderedList,
    li: LI,
    blockquote: Blockquote,

    // Gotcha,

    // @ts-ignore
    p: Paragraph,

    CSEmbed,
    CodeSandboxEmbed: CSEmbed,

    // @ts-ignore
    // this is for the inline code blocks
    code: (props: { children: React.ReactNode }) => {
      return (
        <code className="inline text-content-color px-1 rounded-md no-underline bg-card-dark py-px text-code">
          {props.children}
        </code>
      );
    },

    // @ts-ignore
    // pre: Pre,

    // inline code fences in languages that are not type-checked (css, sh…)
    CodeSnippet,

    DPropLink: DataSourcePropLink,
    DataSourcePropLink,
    DApiLink,
    TreeApiLink,
    ApiLink,
    HookLink,
    PropLink,
    Prop,
    TypeLink,
    PropTable,
    KeyNavApiLink,
    ColumnApiLink,
    CellApiLink,
    RowDetailApiLink,

    LearnLink,
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
  };
  return components;
}

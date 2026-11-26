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
import { createDemoComponents, Terminal } from '@thedatagrid/docs-kit/react';
import { createFrameworkContent } from '@thedatagrid/docs-kit/frameworks/react';
import { resolveFrameworkLink } from '@thedatagrid/docs-kit/frameworks';
import {
  DOCS_CODE_THEMES,
  DOCS_CONTENT_DIR,
  DOCS_DEMO_ANCHOR_PREFIX,
  DOCS_DEMO_HEIGHTS,
  DOCS_DEMO_MANIFEST,
  DOCS_DEMO_MANIFESTS,
} from '../src/utils/docsKit';
import { docsHasPage } from '../src/utils/docsFrameworkContent';
import {
  docsFrameworks,
  DOCS_FALLBACK_NOTICE,
  type DocsFrameworkId,
} from '../src/utils/docsFrameworks';
import {
  docsHookName,
  docsPropAnchors,
  docsPropName,
  type DocsPropsComponent,
  type DocsReferenceName,
} from '../src/utils/docsReferenceNames';
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

type ReferenceLinkComponent = React.ComponentType<any>;

/** The props that have a value: the others stay out of the page's payload. */
const definedProps = <T extends Record<string, unknown>>(props: T) =>
  Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined),
  ) as Partial<T>;

/** The reference page a `<Prop>` list is on: the component whose props it lists. */
const PROPS_PAGES: Record<string, DocsPropsComponent> = {
  '/docs/reference/infinite-table-props': 'InfiniteTable',
  '/docs/reference/datasource-props': 'DataSource',
};

/** On a page of another framework: this demo, snippet or link has no version for it yet. */
const ReactOnlyNotice = () => (
  <span className="docs-framework-notice">{DOCS_FALLBACK_NOTICE}</span>
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

  /**
   * `<PropLink>`, `<HookLink>`, `<ApiLink>`… for the page's framework: they
   * link to its reference page (the React one while it has none), and show
   * the name as it spells it (`[(sortInfo)]` on an Angular page), unless the
   * link has its own text.
   */
  const referenceLink = (
    Link: ReferenceLinkComponent,
    referencePath: string,
    nameFor?: (name: string) => DocsReferenceName | null,
  ) => {
    const path = linkFor(referencePath);
    const FrameworkReferenceLink = (props: {
      name?: string;
      children?: React.ReactNode;
    }) => {
      const name =
        props.name ??
        (typeof props.children === 'string' ? props.children : undefined);
      const showsName = props.children == null || props.children === name;
      const framed = name && nameFor && showsName ? nameFor(name) : null;
      // only what differs from the React link (it's in the page's payload)
      return (
        <Link
          {...props}
          {...definedProps({
            path: path === referencePath ? undefined : path,
            label: framed?.label,
            chip: framed?.chip,
          })}
        />
      );
    };
    return FrameworkReferenceLink;
  };
  const propName = (component: DocsPropsComponent) => (name: string) =>
    docsPropName(framework, component, name);

  // a reference page listing the props of a component: its `<Prop>` entries
  // show the names of the page's framework, and can be linked with those too
  const propsComponent = PROPS_PAGES[fileInfo.routePath.replace(/\/$/, '')];
  const FrameworkProp = (props: React.ComponentProps<typeof Prop>) => {
    const framed = propsComponent
      ? docsPropName(framework, propsComponent, props.name)
      : null;
    const anchors = propsComponent
      ? docsPropAnchors(framework, propsComponent, props.name)
      : [];
    return (
      <Prop
        {...props}
        {...definedProps({
          label: framed?.label,
          chip: framed?.chip,
          more: framed?.more,
          anchors: anchors.length ? anchors : undefined,
        })}
      />
    );
  };

  const components: MDXComponents = {
    // <Demo>, <DemoTitle>, <DemoDescription> (see renderMarkdownPage)
    ...createDemoComponents({
      contentDir: DOCS_CONTENT_DIR,
      folder: fileInfo.folderPath,
      manifest: DOCS_DEMO_MANIFESTS[framework],
      heights: DOCS_DEMO_HEIGHTS,
      themes: DOCS_CODE_THEMES,
      anchorPrefix: DOCS_DEMO_ANCHOR_PREFIX,
      // a demo or snippet without a Vue sibling: the React one, with a notice
      fallback: otherFramework
        ? { manifest: DOCS_DEMO_MANIFEST, notice: DOCS_FALLBACK_NOTICE }
        : undefined,
    }),
    // <FrameworkContent framework="vue"> … </FrameworkContent>
    FrameworkContent: createFrameworkContent(framework),
    HomepageHero: () => <HomepageHero linkFor={linkFor} />,
    Terminal,
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

    DPropLink: referenceLink(
      DataSourcePropLink,
      '/docs/reference/datasource-props',
      propName('DataSource'),
    ),
    DataSourcePropLink: referenceLink(
      DataSourcePropLink,
      '/docs/reference/datasource-props',
      propName('DataSource'),
    ),
    DApiLink: referenceLink(DApiLink, '/docs/reference/datasource-api'),
    TreeApiLink: referenceLink(TreeApiLink, '/docs/reference/tree-api'),
    ApiLink: referenceLink(ApiLink, '/docs/reference/api'),
    HookLink: referenceLink(HookLink, '/docs/reference/hooks', (name) =>
      docsHookName(framework, name),
    ),
    PropLink: referenceLink(
      PropLink,
      '/docs/reference/infinite-table-props',
      propName('InfiniteTable'),
    ),
    Prop: FrameworkProp,
    TypeLink: referenceLink(TypeLink, '/docs/reference/type-definitions'),
    PropTable,
    KeyNavApiLink: referenceLink(
      KeyNavApiLink,
      '/docs/reference/keyboard-navigation-api',
    ),
    ColumnApiLink: referenceLink(ColumnApiLink, '/docs/reference/column-api'),
    CellApiLink: referenceLink(
      CellApiLink,
      '/docs/reference/cell-selection-api',
    ),
    RowDetailApiLink: referenceLink(
      RowDetailApiLink,
      '/docs/reference/row-detail-api',
    ),

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

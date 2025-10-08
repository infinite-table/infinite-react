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
import {
  CodeSnippet as CodeSnippetCmp,
  CodeSnippetProps,
} from '@www/components/CodeSnippet';

import { MarkdownFileInfo } from '@www/utils/MarkdownFileInfo';
import { LI, UnorderedList } from '@www/components/UnorderedList';
import { Blockquote } from '@www/components/Blockquote';

import HomepageHero from '@www/components/MDX/HomepageHero';
import TerminalBlock from '../src/components/MDX/TerminalBlock';

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

export function useMDXComponents(fileInfo: MarkdownFileInfo): MDXComponents {
  const CodeSnippet = (props: CodeSnippetProps) => {
    return <CodeSnippetCmp {...props} cwd={fileInfo.folderPath} />;
  };

  const components: MDXComponents = {
    HomepageHero,
    TerminalBlock,
    HeroCards,
    Illustration,
    IllustrationBlock,
    YouWillLearnCard,
    Description,
    Intro,
    Note,

    // Sandpack: CodeSnippet,
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

    CodeSnippet,
    Snippet: (props: { children: React.ReactNode }) => {
      const children = React.Children.toArray(props.children);

      let code: React.ReactElement<CodeSnippetProps> | undefined;
      let description: React.ReactNode | undefined;

      for (const child of children) {
        //@ts-ignore
        if (child.type === CodeSnippet) {
          //@ts-ignore
          code = child;
          //@ts-ignore
        } else if (child.type === Description) {
          //@ts-ignore
          description = child;
        }
      }

      if (!code) {
        return children;
      }

      return React.cloneElement(code!, {
        live: true,
        description,
      });
    },

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
  components.Sandpack = components.Snippet;
  return components;
}

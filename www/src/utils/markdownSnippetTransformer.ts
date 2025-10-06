import { Parser, Program } from 'acorn';
import jsx from 'acorn-jsx';
// import { Code, Parent, Root } from 'mdast';
import { MdxFlowExpression } from 'mdast-util-mdx';
import { visit } from 'unist-util-visit';

const parser = Parser.extend(jsx());

import {
  MarkdownFileEnv,
  MarkdownFileInfo,
  SnippetMetaProps,
} from './MarkdownFileInfo';
import { getCodeSnippetInfo } from './markdownFileUtils';

export default (params: {
  fileInfo: MarkdownFileInfo;
  env: MarkdownFileEnv;
}) => {
  const { fileInfo, env } = params;
  const transformer = (ast: any) => {
    visit(ast, 'code', (node, index, parent) => {
      if (!node.lang) {
        return;
      }
      if (index == null) {
        return;
      }

      let meta = node.meta || '';

      const snippetMetaProps: SnippetMetaProps = getCodeSnippetInfo(
        {
          meta,
          body: node.value,
          lang: node.lang,
        },
        fileInfo,
        env,
      );

      const propsAsStr = Object.keys(snippetMetaProps)
        .reduce((acc, key) => {
          acc.push(`${key}={${JSON.stringify(snippetMetaProps[key])}}`);
          return acc;
        }, [] as string[])
        .join(' ');

      const value = `<CodeSnippet ${propsAsStr} />`;

      const estree = parser.parse(value, {
        ecmaVersion: 'latest',
      }) as Program;
      parent!.children[index!] = {
        type: 'mdxFlowExpression',
        value,
        data: { estree },
      } as MdxFlowExpression;
    });
  };
  /**
   * A markdown plugin for transforming code metadata.
   *
   * @returns A unified transformer.
   */
  return () => transformer;
};

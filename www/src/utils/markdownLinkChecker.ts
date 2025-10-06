// import { Parser } from "acorn";
// import jsx from "acorn-jsx";
import { visit } from 'unist-util-visit';

import { MarkdownFileEnv, MarkdownFileInfo } from './MarkdownFileInfo';
import { siteContent } from '../content';

// Parser.extend(jsx());

export default (env: MarkdownFileEnv & { fileInfo: MarkdownFileInfo }) => {
  const transformer = (ast: any) => {
    visit(ast, 'link', (node) => {
      if (!node.url.startsWith('/')) {
        return;
      }

      const key = node.url.startsWith('/docs')
        ? node.url.slice('/docs'.length) || '/'
        : node.url;

      // console.log("key", key);

      if (!siteContent.paths[key]) {
        const errorMessage = `Link not valid: "${node.url}", found in file ${
          env.fileInfo.fileAbsolutePath
        }.
Valid links are:
${Object.keys(siteContent.paths)
  .map((x) => `/docs${x}`)
  .join('\n ')}`;

        console.error(`\n\ \n \n ${errorMessage} \n \n \n`);
        throw new Error(errorMessage);
      }
    });
  };
  /**
   * A markdown plugin for checking the validity of links.
   *
   * @returns A unified transformer.
   */
  return () => transformer;
};

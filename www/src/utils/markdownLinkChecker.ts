// import { Parser } from "acorn";
// import jsx from "acorn-jsx";
import { visit } from 'unist-util-visit';

import { MarkdownFileEnv, MarkdownFileInfo } from './MarkdownFileInfo';
import { siteContent } from '../content';

const EXCEPTIONS = ['/full-demo', '//404', '/pricing'];

const exceptionsMap = EXCEPTIONS.reduce((acc, url) => {
  acc[url] = true;
  return acc;
}, {} as Record<string, boolean>);

export default (env: MarkdownFileEnv & { fileInfo: MarkdownFileInfo }) => {
  const transformer = (ast: any) => {
    visit(ast, 'link', (node) => {
      if (!node.url.startsWith('/')) {
        return;
      }

      const url = new URL(node.url, 'https://infinite-table.com');
      const key = url.pathname;

      if (exceptionsMap[key]) {
        return;
      }

      if (!siteContent.paths[key] && !siteContent.paths[key + '/']) {
        const errorMessage = `Link not valid: "${key}", found in file ${env.fileInfo.fileAbsolutePath}.`;

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

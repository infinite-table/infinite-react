import fs from 'fs';
import path from 'path';

import { Parser } from 'acorn';
import jsx from 'acorn-jsx';
// import { Code, Parent, Root } from 'mdast';
// import { MdxFlowExpression } from 'mdast-util-mdx';
import { visit } from 'unist-util-visit';

const parser = Parser.extend(jsx());

import rangeParser from 'parse-numeric-range';

const dirname = path.resolve('..');

const ROOT_DOCS_PAGES = path.resolve(dirname, `./www/content/docs`);
const DOCS_ENV_VAR = '$DOCS';

const HIGHLIGHT_REGEX = /{([\d,-]+)}/;
/**
 *
 * @param metastring string provided after the language in a markdown block
 * @returns array of lines to highlight
 * @example
 * ```js {1-3,7} [[1, 1, 20, 33], [2, 4, 4, 8]] App.js active
 * ...
 * ```
 *
 * -> The metastring is `{1-3,7} [[1, 1, 20, 33], [2, 4, 4, 8]] App.js active`
 */
function getHighlightLines(metastring) /*: number[]*/ {
  const parsedMetastring = HIGHLIGHT_REGEX.exec(metastring);
  if (!parsedMetastring) {
    return [];
  }
  return rangeParser(parsedMetastring[1]);
}

function getMetaAsProps(meta = '') {
  const metaBlocks = meta.match(/(?:[^\s"]+|"[^"]*")+/g);

  return metaBlocks.reduce((acc, block) => {
    let [key, value] = block.split('=');
    if (value && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (!value) {
      value = true;
    }

    acc[key] = value;

    return acc;
  }, {});
}

const getFileAbsolutePath = (codeFile, requestingDocsFile) => {
  let result = '';

  if (codeFile.includes(DOCS_ENV_VAR)) {
    const filePath = codeFile.replace(`${DOCS_ENV_VAR}/`, '');
    result = path.resolve(ROOT_DOCS_PAGES, filePath);
  } else {
    result = path.resolve(requestingDocsFile.dirname, codeFile);
  }
  return result;
};

function getFileContents(fileName, currentFile, initialCode, env) {
  const fileAbsolutePath = getFileAbsolutePath(fileName, currentFile);

  if (!fs.existsSync(fileAbsolutePath)) {
    throw Error(
      `Invalid file location for code snippet; no such file "${fileAbsolutePath}" (required by ${currentFile.basename})`,
    );
  }

  let fileContent = fs.readFileSync(fileAbsolutePath, 'utf8').trim();

  if (fileContent) {
    const log = fileContent.includes('NEXT_PUBLIC_BASE_URL');
    fileContent = fileContent.replace(
      /process.env\.NEXT_PUBLIC_BASE_URL/g,
      `'${env.NEXT_PUBLIC_BASE_URL}'`,
    );
  }

  return fileContent;
}

export default (env) => {
  const transformer = (ast, currentFile) => {
    visit(ast, 'code', (node, index, parent) => {
      if (!node.meta) {
        return;
      }
      if (!node.lang) {
        return;
      }
      let meta = node.meta;
      // we need to deal with meta lines that look like this
      // ```tsx {2,3-7} hidden file="./learn/getting-started/meet-the-code.page.tsx" title="x"
      const highlightLines = getHighlightLines(meta);
      if (highlightLines.length) {
        meta = meta.replace(HIGHLIGHT_REGEX, '');
      }
      let code = JSON.stringify(`${node.value}\n`);
      let metaPropsStr = '';
      let metaProps = {};

      if (meta) {
        metaProps = getMetaAsProps(meta);

        Object.entries(metaProps).forEach(([key, value]) => {
          metaPropsStr += ` ${key}="${value}"`;
        });
      }

      let file = metaProps.file;

      if (file) {
        if (typeof file !== 'string') {
          throw Error(
            `Error with file - metaProps ${JSON.stringify(metaProps)}`,
          );
        }
        file = file.trim();
      }

      if (file) {
        code = getFileContents(file, currentFile, code, env);

        code = `${JSON.stringify(code)}`;

        if (metaProps.file && metaProps.as) {
          metaProps.file = metaProps.as;

          // recompute the metaPropsStr
          metaPropsStr = '';
          Object.entries(metaProps).forEach(([key, value]) => {
            metaPropsStr += ` ${key}="${value}"`;
          });
        }

        const metaPropNames = Object.keys(metaProps);

        if (metaPropNames.length) {
          metaPropsStr += ` metaPropNames="${metaPropNames.join(',')}"`;
        }
      }
      const codeProps = `className="language-${node.lang}" highlightLines="${highlightLines}"${metaPropsStr}`;

      const value = `<pre ><code ${codeProps}>{${code}}</code></pre>`;

      const estree = parser.parse(value, { ecmaVersion: 'latest' });
      parent.children[index] = {
        type: 'mdxFlowExpression',
        value,
        data: { estree },
      };
    });
  };
  /**
   * A markdown plugin for transforming code metadata.
   *
   * @returns A unified transformer.
   */
  const remarkMdxCodeMeta = () => transformer;
  return remarkMdxCodeMeta;
};

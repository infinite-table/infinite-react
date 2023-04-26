/**
 * Based on gatsby-remark-import-code (see https://github.com/pomber/gatsby-remark-import-code/blob/master/index.js)
 */

import fs from 'fs';
import path from 'path';
import { visit } from 'unist-util-visit';
// const url = require('url');

const dirname = path.resolve('..');

const META_TAG_FILE = 'file';
const META_TAG_AS = 'as';

const ROOT_DOCS_PAGES = path.resolve(dirname, `./www/_pages/docs`);
const DOCS_ENV_VAR = '$DOCS';

function codeImport(options = {}) {
  const getFileAbsolutePath = (codeFileMeta, requestingDocsFile) => {
    let result = '';
    if (codeFileMeta.includes(DOCS_ENV_VAR)) {
      const filePath = codeFileMeta.replace(`${DOCS_ENV_VAR}/`, '');
      result = path.resolve(ROOT_DOCS_PAGES, filePath);
    } else {
      result = path.resolve(requestingDocsFile.dirname, codeFileMeta);
    }
    return result;
  };

  return function transformer(tree, file) {
    const codes = [];

    visit(tree, 'code', (node, index, parent) => {
      // if (node.meta) {
      //   console.log('previous', parent.children[index - 1]);
      //
      //   //console.log('parent ', parent);
      // }
      codes.push([node, index, parent]);
    });

    for (const [node] of codes) {
      // console.log('node meta', node.meta);
      if (!node.meta) {
        continue;
        // console.log('node ', node);
      }

      const nodeMeta = node.meta || '';
      const nodeMetaTags = nodeMeta.split(/\s+/);
      const fileMeta = nodeMetaTags.find((meta) =>
        meta.startsWith(`${META_TAG_FILE}=`),
      );
      const asMeta = nodeMetaTags.find((meta) =>
        meta.startsWith(`${META_TAG_AS}=`),
      );

      if (!fileMeta) {
        continue;
      } else {
        console.log('❗️❗️❗️❗️❗️❗️❗️');
        console.log('❗️❗️❗️❗️❗️❗️❗️');
        console.log('❗️❗️❗️❗️❗️❗️❗️');
        console.log('❗️❗️❗️❗️❗️❗️❗️');
        console.log('❗️❗️❗️❗️❗️❗️❗️');
        console.log('fileMeta', fileMeta);
      }

      if (fileMeta.includes('..')) {
        throw Error(
          `File ${file.basename} contains a relative path for a code snippet: ${fileMeta}! 
          Use the ${DOCS_ENV_VAR} variable instead!`,
        );
      }

      const [, fileName] = fileMeta.split(/=(.*)/);
      const [, asFileName] = asMeta ? asMeta.split(/=(.*)/) : [];

      const fileAbsolutePath = getFileAbsolutePath(fileName, file);

      if (!fs.existsSync(fileAbsolutePath)) {
        throw Error(
          `Invalid file location for code snippet; no such file "${fileAbsolutePath}" (required by ${file.basename})`,
        );
      }

      let fileContent = fs.readFileSync(fileAbsolutePath, 'utf8').trim();

      if (fileContent) {
        fileContent = fileContent.replace(
          /process.env\.NEXT_PUBLIC_BASE_URL/g,
          `'${process.env.NEXT_PUBLIC_BASE_URL}'`,
        );
      }
      if (asFileName) {
        // if another name specifed in "as", override the meta with this one
        node.meta = `file=${asFileName}`;
      }
      node.value = fileContent;
    }
  };
}

export default codeImport;
module.exports = codeImport;

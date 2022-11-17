/**
 * Based on gatsby-remark-import-code (see https://github.com/pomber/gatsby-remark-import-code/blob/master/index.js)
 */

const fs = require('fs');
const path = require('path');
const visit = require('unist-util-visit');

const META_TAG_FILE = 'file';
const META_TAG_AS = 'as';

const ROOT_DOCS_PAGES = path.resolve(__dirname, `../pages/docs`);
const DOCS_ENV_VAR = '$DOCS';

function codeImport(options = {}) {
  const getFileAbsolutePath = (codeFileMeta, requestingDocsFile) => {
    if (codeFileMeta.includes(DOCS_ENV_VAR)) {
      const filePath = codeFileMeta.replace(`${DOCS_ENV_VAR}/`, '');
      return path.resolve(ROOT_DOCS_PAGES, filePath);
    } else {
      return path.resolve(requestingDocsFile.dirname, codeFileMeta);
    }
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

module.exports = codeImport;

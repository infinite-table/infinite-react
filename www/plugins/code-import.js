/**
 * Based on gatsby-remark-import-code (see https://github.com/pomber/gatsby-remark-import-code/blob/master/index.js)
 */

const fs = require('fs');
const path = require('path');
const visit = require('unist-util-visit');

const META_TAG_FILE = 'file';

const FILE_PATH_PREFIX = '../src/code-snippets';

function codeImport(options = {}) {
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
      console.log('node meta', node.meta);
      if (!node.meta) {
        continue;
        // console.log('node ', node);
      }

      const nodeMeta = node.meta || '';
      const nodeMetaTags = nodeMeta.split(/\s+/);
      const fileMeta = nodeMetaTags.find((meta) =>
        meta.startsWith(`${META_TAG_FILE}=`)
      );

      if (!fileMeta) {
        continue;
      }

      const [, fileName] = fileMeta.split(/=(.*)/);

      const fileLocation = file.history[0];

      const fileAbsolutePath = path.resolve(fileLocation, '../.', fileName);

      if (!fs.existsSync(fileAbsolutePath)) {
        throw Error(
          `Invalid file location for code snippet; no such file "${fileAbsolutePath}"`
        );
      }

      let fileContent = fs.readFileSync(fileAbsolutePath, 'utf8').trim();

      if (fileContent) {
        fileContent = fileContent.replace(
          /process.env\.NEXT_PUBLIC_BASE_URL/g,
          `'${process.env.NEXT_PUBLIC_BASE_URL}'`
        );
      }
      node.value = fileContent;
    }
  };
}

module.exports = codeImport;

const remark = require('remark');
const externalLinks = require('remark-external-links'); // Add _target and rel to external links
const customHeaders = require('./remark-header-custom-ids'); // Custom header id's for i18n
const images = require('remark-images'); // Improved image syntax
const unwrapImages = require('remark-unwrap-images'); // Removes <p> wrapper around images
const smartyPants = require('./remark-smartypants'); // Cleans up typography
const codeImport = require('./code-import'); // imports code snippets from external files
const milestones = require('./remark-milestone'); // replaces @milestone tag with a milestone contents
const html = require('remark-html');

const mdxMermaid = require('mdx-mermaid');

module.exports = {
  remarkPlugins: [
    externalLinks,
    mdxMermaid,
    milestones,
    customHeaders,
    images,
    unwrapImages,
    smartyPants,
    codeImport,
  ],
  markdownToHtml,
};

async function markdownToHtml(markdown) {
  const result = await remark()
    .use(milestones)
    .use(codeImport)
    .use(externalLinks)
    .use(mdxMermaid)
    .use(customHeaders)

    .use(images)

    .use(unwrapImages)
    .use(smartyPants)
    .use(html)
    .process(markdown);
  return result.toString();
}

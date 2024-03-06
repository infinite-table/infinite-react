import {
  ComputedFields,
  defineDocumentType,
  FieldDefs,
  makeSource,
} from 'contentlayer/source-files';

import codeMeta from './plugins/code-meta.mjs';
import remarkMilestones from './plugins/remark-milestone.mjs';
//@ts-ignore
import remarkRemoveComments from 'remark-remove-comments';
// import removeHTMLComments from './plugins/remove-html-comments.mjs';

import fm from 'gray-matter';

import readingTime from 'reading-time';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
// import remarkMdxCodeMeta from 'remark-mdx-code-meta';

import rehypeStringify from 'rehype-stringify';

// import { visit } from 'unist-util-visit';
// // import pkg from 'unist-util-visit';
// // const { visit } = pkg;

// /** @type {import('unified').Plugin<Array<void>, import('hast').Root>} */
// function rehypeMetaAsAttributes() {
//   return (tree) => {
//     visit(tree, 'element', (node) => {
//       if (node.tagName === 'code' && node.data && node.data.meta) {
//         node.properties.meta = node.data.meta;
//       }
//     });
//   };
// }

async function excerptToHTML(excerpt: string) {
  const file = await unified()
    .use(remarkParse)
    //@ts-ignore
    .use(remarkRehype)
    // .use(rehypeMetaAsAttributes)

    //@ts-ignore
    .use(rehypeStringify)
    .process(excerpt);

  return String(file);
}

const pageFields: FieldDefs = {
  title: {
    type: 'string',
    description: 'The title of the post',
    required: true,
  },
  layout: {
    type: 'enum',
    options: ['Releases', 'API'],
  },
  description: {
    type: 'string',
    description: 'The description of the post',
  },
  metaDescription: {
    type: 'string',
    description: 'The metadata description of the post',
  },
  metaTitle: {
    type: 'string',
    description: 'The metadata title of the post',
  },
  redirect_to: {
    type: 'string',
  },
};
const pageComputedFields: ComputedFields<string> = {
  url: {
    type: 'string',
    resolve: (docsPage) => {
      const url = `/${docsPage._raw.flattenedPath}`
        .replace('.page', '')
        .replace('/index', '');

      return url;
    },
  },
};

export const DocsPage = defineDocumentType(() => ({
  name: 'DocsPage',
  filePathPattern: `./docs/**/*.page.md`,
  contentType: 'mdx',
  fields: pageFields,
  computedFields: pageComputedFields,
}));

export const RootPage = defineDocumentType(() => ({
  name: 'RootPage',
  filePathPattern: `./*.page.md`,
  contentType: 'mdx',
  fields: pageFields,
  computedFields: pageComputedFields,
}));

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `./blog/**/*.md`,
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      description: 'The title of the post',
      required: true,
    },
    description: {
      type: 'string',
      description: 'The description of the post',
    },
    hide_in_homepage: {
      type: 'boolean',
      description: 'Whether to hide the post in the homepage',
    },

    author: {
      type: 'json',

      description: 'The authors of the post',
    },
    draft: {
      type: 'boolean',
      description: 'Whether the post is a draft',
    },
    excerpt: {
      type: 'string',
      description: 'A short excerpt of the post',
    },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (post) => `/${post._raw.flattenedPath}`.replace('.page', ''),
    },

    date: {
      type: 'string',
      resolve: (post) => {
        const [year, month, day] = post._raw.flattenedPath
          .replace('blog/', '')
          .split('/');

        return [year, month, day].join('-');
      },
    },
    description: {
      type: 'string',
      resolve: (post) => post.description || post.title,
    },
    excerpt: {
      type: 'string',
      resolve: async (post) => {
        // const excerpt = post.body.raw.split('\n').slice(0, 2).join(' ');
        const rawStr = post.body.raw;

        const { data, excerpt } = fm(rawStr, {
          //@ts-ignore
          excerpt: function firstLine(file, options) {
            //@ts-ignore
            file.excerpt = file.content.split('\n').slice(0, 2).join(' ');
          },
        });

        const theExcerpt = data.excerpt ?? excerpt;

        return await excerptToHTML(theExcerpt.trimLeft().trim() || '');
      },
    },
    readingTime: {
      type: 'string',
      resolve: (post) => {
        try {
          const time = readingTime(post.body.raw);

          return time.text;
        } catch (ex) {
          return 'a few minutes read';
        }
      },
    },
  },
}));

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post, DocsPage, RootPage],
  mdx: {
    esbuildOptions: (options) => {
      // options.platform = 'node';
      // options.packages = 'external';

      return options;
    },
    // rehypePlugins: [rehypeMetaAsAttributes],
    remarkPlugins: [
      codeMeta({
        NEXT_PUBLIC_BASE_URL:
          process.env.NEXT_PUBLIC_BASE_URL ||
          'https://infinite-table.com/.netlify/functions/json-server',
      }),

      remarkMilestones,

      // remarkMdxCodeMeta,
      // codeImport,
      // remarkMdxCodeMeta,
      /*remarkMdxCodeMeta rehypeMetaAsAttributes*/
    ],
  },
});

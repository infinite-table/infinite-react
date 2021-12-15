const fs = require('fs-extra');
const path = require('path');
const fm = require('gray-matter');
const globby = require('globby');
const parseISO = require('date-fns/parseISO');
const readingTime = require('reading-time');
const {
  markdownToHtml,
} = require('../plugins/markdownToHtml');

/**
 * This looks at the ./src/pages/blog directory and creates a route manifest that can be used
 * in the sidebar and footers, and (in theory) category and author pages.
 *
 * For now, the blog manifest is a big array in reverse chronological order.
 */
Promise.resolve()
  .then(async () => {
    const routes = [];

    const blogPosts = await globby(
      'pages/blog/**/*.page.md'
    );

    for (let postpath of blogPosts) {
      const [year, month, day, title] = postpath
        .replace('pages/blog/', '')
        .split('/');
      // console.log({ year, month, day });
      const rawStr = await fs.readFile(postpath, 'utf8');
      const { data, excerpt, content } = fm(rawStr, {
        excerpt: function firstLine(file, options) {
          file.excerpt = file.content
            .split('\n')
            .slice(0, 2)
            .join(' ');
        },
      });
      const rendered = await markdownToHtml(
        excerpt.trimLeft().trim()
      );

      const route = {
        //remove the .page from end
        path: postpath
          .replace('pages', '')
          .slice(0, -1 * '.page.md'.length),
        date: [year, month, day].join('-'),
        title: data.title,
        author: data.author,
        excerpt: rendered,
        readingTime: readingTime(content).text,
      };
      routes.unshift(route);
    }

    const sorted = routes.sort((post1, post2) =>
      parseISO(post1.date) > parseISO(post2.date) ? -1 : 1
    );
    const blogManifest = {
      routes: sorted,
    };
    const blogRecentSidebar = {
      routes: [
        {
          title: 'Recent Posts',
          path: '/blog',
          heading: true,
          routes: sorted.slice(0, 25),
        },
      ],
    };

    await fs.writeFile(
      path.resolve(__dirname, '../src/blogIndex.json'),
      JSON.stringify(blogManifest, null, 2)
    );
    await fs.writeFile(
      path.resolve(
        __dirname,
        '../src/blogIndexRecent.json'
      ),
      JSON.stringify(blogRecentSidebar, null, 2)
    );
  })
  .catch(console.error);

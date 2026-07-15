// Vite plugin: test page index routes + dev API for folder listings.
const {
  buildTestPagesIndexProps,
  collectTestIndexRoutePaths,
  inferRelativePath,
} = require('./buildTestPagesIndexProps');

const VIRTUAL_ROUTES_ID = 'virtual:test-index-routes';
const RESOLVED_ROUTES_ID = '\0' + VIRTUAL_ROUTES_ID;

/**
 * @param {{ pagesRoot?: string }} [options]
 */
function testPagesIndexPlugin(options = {}) {
  const pagesRoot =
    options.pagesRoot ||
    require('path').join(process.cwd(), 'src', 'pages');

  return {
    name: 'vite-plugin-test-pages-index',
    enforce: 'pre',

    resolveId(id) {
      if (id === VIRTUAL_ROUTES_ID) {
        return RESOLVED_ROUTES_ID;
      }
    },

    load(id) {
      if (id === RESOLVED_ROUTES_ID) {
        const routes = collectTestIndexRoutePaths(pagesRoot);
        return `export const testIndexRoutes = ${JSON.stringify(routes)};`;
      }
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/__test-index-props')) {
          return next();
        }

        try {
          const url = new URL(req.url, 'http://localhost');
          const relativePath = url.searchParams.get('path') || '';
          const props = buildTestPagesIndexProps(relativePath, {
            pagesRoot,
            pageSuffix: '.page.vue',
          });

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(props));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: e && e.message ? e.message : String(e),
            }),
          );
        }
      });
    },
  };
}

module.exports = {
  testPagesIndexPlugin,
  inferRelativePath,
};

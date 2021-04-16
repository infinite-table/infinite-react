// next.config.js
const path = require('path');
const examplesFolder = path.resolve(__dirname);
const parentFolder = path.resolve(__dirname, '../');

/**
 * This is here to make nextjs compile the src folder, which is outside the examples folder
 */

const withParentFolder = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      config.module.rules.forEach(rule => {
        const ruleContainsTs =
          rule.test && rule.test.test && rule.test.test('index.tsx');

        if (ruleContainsTs && Array.isArray(rule.include)) {
          rule.include = rule.include.map(include => {
            if (include === examplesFolder) {
              return parentFolder;
            }

            return include;
          });
        }
      });

      // needed in order to avoid 2 copies of react being included, which makes hooks not work
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias.react = path.resolve('../node_modules/react');
      config.resolve.alias['react-dom'] = path.resolve(
        '../node_modules/react-dom',
      );
      config.resolve.alias['@components'] = path.resolve('../src/components');
      config.resolve.alias['@src'] = path.resolve('../src');
      config.resolve.alias['@examples'] = path.resolve('./src');
      return config;
    },
  });
};
module.exports = {
  ...withParentFolder(),
  pageExtensions: ['page.tsx', 'page.ts', 'page.js'],
};

const path = require("path");

const { createVanillaExtractPlugin } = require("@vanilla-extract/next-plugin");
const withVanillaExtract = createVanillaExtractPlugin();

const withMDX = require("@next/mdx")({
  extension: /\.mdx$/,
});

const postCssPlugins = [
  // Below PostCSS references Next.js default configuration
  // https://nextjs.org/docs/advanced-features/customizing-postcss-config#customizing-plugins
  "postcss-flexbugs-fixes",
  [
    "postcss-preset-env",
    {
      autoprefixer: {
        flexbox: "no-2009",
      },
      stage: 3,
      features: {
        "custom-properties": false,
      },
    },
  ],
];

const nextConfig = withMDX({
  pageExtensions: ["page.tsx", "page.mdx"],

  reactStrictMode: true,
  webpack(config) {
    config.resolve.alias["@www"] = path.resolve("./src");
    config.resolve.alias["@infinite-table/infinite-react"] = path.resolve(
      "../source/dist/index.esm.js"
    );
    config.resolve.alias.react = path.resolve("./node_modules/react");
    config.resolve.alias["react-dom"] = path.resolve(
      "./node_modules/react-dom"
    );
    // needed for bundling the ts-compiler for browser usage
    config.resolve.alias["os"] = path.resolve("./build/shims/os-shim.js");
    config.resolve.alias["fs"] = path.resolve("./node_modules/node-browserfs");
    config.resolve.alias["perf_hooks"] = path.resolve(
      "./build/shims/perf_hooks.js"
    );
    config.resolve.alias["path"] = path.resolve(
      "./node_modules/path-browserify"
    );

    return config;
  },
});
const createNextPluginPreval = require("next-plugin-preval/config");
const withNextPluginPreval = createNextPluginPreval();
module.exports = withNextPluginPreval(withVanillaExtract(nextConfig));

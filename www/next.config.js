const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const { VanillaExtractPlugin } = require("@vanilla-extract/webpack-plugin");
const {
  getGlobalCssLoader,
} = require("next/dist/build/webpack/config/blocks/css/loaders");

const withMDX = require("@next/mdx")({
  extension: /\.mdx$/,
});
module.exports = withMDX({
  future: {
    webpack5: true,
  },
  pageExtensions: ["page.tsx", "page.mdx"],

  webpack(config, options) {
    let { dev, isServer } = options;

    // dev = true;

    config.module.rules.push({
      test: /\.css$/i,
      sideEffects: true,
      use: dev
        ? getGlobalCssLoader(
            {
              assetPrefix: options.config.assetPrefix,
              future: {
                webpack5: true,
              },
              isClient: !isServer,
              isServer,
              isDevelopment: dev,
            },
            [],
            []
          )
        : [MiniCssExtractPlugin.loader, "css-loader"],
    });

    const plugins = [];

    if (!dev) {
      plugins.push(
        new MiniCssExtractPlugin({
          filename: "static/css/[contenthash].css",
          chunkFilename: "static/css/[contenthash].css",
          ignoreOrder: true,
        })
      );
    }
    plugins.push(new VanillaExtractPlugin({}));
    config.plugins.push(...plugins);

    // config.module.rules.push({
    //   test: /\.css$/,
    //   use: [MiniCssExtractPlugin.loader, "css-loader"],
    // });
    // config.plugins.push(
    //   new VanillaExtractPlugin(),
    //   new MiniCssExtractPlugin({
    //     // without these Next.js will look for the generated stylesheets from the wrong place
    //     filename: "static/chunks/[chunkhash].css",
    //     chunkFilename: "static/chunks/[chunkhash].css",
    //   })
    // );

    return config;
  },
});

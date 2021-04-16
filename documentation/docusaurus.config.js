module.exports = {
  title: "InfiniteTable",

  tagline: "The most productive React Table",
  url: "https://infinite-table.com",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "infinite-table", // Usually your GitHub org/user name.
  projectName: "react-table", // Usually your repo name.
  themeConfig: {
    navbar: {
      title: "InfiniteTable",
      logo: {
        alt: "InfiniteTable Logo",
        src: "img/logo.png",
      },
      items: [
        { to: "docs/overview", label: "Docs", position: "left" },
        { to: "blog", label: "Blog", position: "left" },
        {
          href: "https://github.com/infinite-table/react-table",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Docs",
              to: "docs/overview",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Discord",
              href: "https://discordapp.com/invite/docusaurus",
            },
          ],
        },
        {
          title: "Social",
          items: [
            {
              label: "Blog",
              to: "blog",
            },
          ],
        },
      ],
      logo: {
        alt: "InfiniteTable",
        src: "img/logo.png",
      },
      copyright: `Copyright © ${new Date().getFullYear()} Infinite Table, Inc. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};

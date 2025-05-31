import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import type { Plugin } from 'vite';

let fileMapping: Record<string, string> = {};

const SOURCE_TO_MAPPING = {
  'src/content.ts': 'content',
  'src/content.css': 'contentCss.css',
  'src/background/infinitebackground.ts': 'infinitebackground',
  'src/index.html': 'index',
  'src/panel.html': 'panel',
  'popup/popup.html': 'popup',
};

// also add the relative path to the mapping
Object.keys(SOURCE_TO_MAPPING).forEach((source) => {
  SOURCE_TO_MAPPING[`./${source}`] = SOURCE_TO_MAPPING[source];
});

// Custom plugin to update manifest.json with correct hashed filenames
const updateManifestPlugin = (): Plugin => {
  return {
    name: 'update-manifest',
    apply: 'build',

    // Capture filename mappings during bundle generation
    generateBundle(_, bundle) {
      // Map original chunk names to their output filenames
      for (const fileName in bundle) {
        const chunk = bundle[fileName];

        if (chunk.type === 'chunk' && chunk.name) {
          fileMapping[chunk.name] = fileName;
        } else if (chunk.type === 'asset' && chunk.name) {
          fileMapping[chunk.names[0]] = fileName;
        }
      }
    },
  };
};

const DEV = process.env.NODE_ENV !== 'production';
// https://vite.dev/config/
export default defineConfig({
  define: {
    __DEV__: JSON.stringify(DEV),
    __VERSION__: JSON.stringify('v1.0.0'),
    __VERSION_TIMESTAMP__: JSON.stringify(new Date().getTime()),
  },

  resolve: {
    alias: {
      'devtools-ui': path.resolve(__dirname, '../devtools-ui/dist'),
      'devtools-ui/index.css': path.resolve(
        __dirname,
        '../devtools-ui/dist/index.css',
      ),
    },
  },
  optimizeDeps: {
    exclude: ['@rollup/rollup-linux-x64-gnu'],
  },
  build: {
    outDir: path.resolve(__dirname, 'dist' + (DEV ? '-dev' : '')),
    minify: false,
    cssMinify: false,
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        panel: './src/panel.html',
        index: './src/index.html',
        popup: './popup/popup.html',
        content: './src/content.ts',
        contentCss: './src/content.css',
        infinitebackground: './src/background/infinitebackground.ts',
        manifest: './manifest.json',
      },
      external: [],
    },
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'icons/icon16.png',
          dest: 'icons',
        },
        {
          src: 'icons/icon48.ico',
          dest: 'icons',
        },
        {
          src: 'manifest.json',
          dest: '.',
          transform: (contents) => {
            const manifest = JSON.parse(contents.toString());

            // Update paths to reference the compiled files
            if (manifest.background && manifest.background.service_worker) {
              const serviceWorkerFile = manifest.background.service_worker;

              if (serviceWorkerFile && SOURCE_TO_MAPPING[serviceWorkerFile]) {
                manifest.background.service_worker =
                  fileMapping[SOURCE_TO_MAPPING[serviceWorkerFile]];
              }
            }

            if (
              manifest.content_scripts &&
              manifest.content_scripts.length > 0
            ) {
              if (Array.isArray(manifest.content_scripts[0].js)) {
                manifest.content_scripts[0].js =
                  manifest.content_scripts[0].js.map((file) => {
                    const mappingName = SOURCE_TO_MAPPING[file];
                    if (mappingName) {
                      return './' + fileMapping[mappingName];
                    }
                    return file;
                  });
              }
              manifest.content_scripts[0].css =
                manifest.content_scripts[0].css.map((file) => {
                  const mappingName = SOURCE_TO_MAPPING[file];
                  if (mappingName) {
                    return './' + fileMapping[mappingName];
                  }
                  return file;
                });
            }

            // if (manifest.action && manifest.action.default_popup) {
            //   manifest.action.default_popup = 'popup.html';
            // }

            // if (
            //   manifest.devtools_page &&
            //   SOURCE_TO_MAPPING[manifest.devtools_page]
            // ) {
            //   manifest.devtools_page =
            //     fileMapping[SOURCE_TO_MAPPING[manifest.devtools_page]];
            // }

            return JSON.stringify(manifest, null, 2);
          },
        },
      ],
    }),
    updateManifestPlugin(),
  ],
});

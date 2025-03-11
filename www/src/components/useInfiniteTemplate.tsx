// import raw from 'raw.macro';

import { SandpackFile } from '@codesandbox/sandpack-react';

export interface TemplateConfig {
  sandpackTemplate: 'react';
  sandpackTemplateFiles: Record<string, SandpackFile>;
  validCustomFileNames: string[];
}

export const useInfiniteTemplate = (): TemplateConfig => {
  const validCustomFileNames = ['index.tsx', 'App.tsx', 'styles.css'];
  const sandpackTemplate = 'react';
  const sandpackTemplateFiles = getReactTemplateFiles();

  return {
    sandpackTemplate,
    validCustomFileNames,
    sandpackTemplateFiles,
  };
};
const getReactTemplateFiles = (): Record<string, SandpackFile> => {
  return {
    '/App.tsx': {
      code: BASE_FILE_REACT_APP,
      active: true,
    },

    '/index.tsx': {
      code: BASE_FILE_REACT_INDEX,
      hidden: true,
    },
    '/styles.css': {
      code: BASE_FILE_REACT_STYLES,
      hidden: true,
    },
    '/public/index.html': {
      code: BASE_INDEX_HTML,
      hidden: true,
    },
    '/sandbox.config.json': {
      code: `{ "infiniteLoopProtection": true }`,
      hidden: true,
    },
  };
};

// react
// const BASE_PATH_REACT_PREFIX =
//   '../code-snippets/base-react/src';
// const BASE_FILE_REACT_APP = raw(
//   `${BASE_PATH_REACT_PREFIX}/App.tsx`
// );

const BASE_FILE_REACT_APP = ``;
// const BASE_FILE_REACT_INDEX = raw(
//   `${BASE_PATH_REACT_PREFIX}/index.tsx`
// );

const BASE_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>
  <body>
    <div id="root" class="infinite-theme-mode--dark"></div>
  </body>
</html>`;
const BASE_FILE_REACT_INDEX = `
import * as React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@infinite-table/infinite-react/index.css';

import App from './App';
import './styles.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

`;
// const BASE_FILE_REACT_STYLES = raw(
//   `${BASE_PATH_REACT_PREFIX}/styles.css`
// );

const BASE_FILE_REACT_STYLES = `
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
    'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
    'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas,
    'Courier New', monospace;
}

html,
body,
#root {
  height: 100%;
}
* {
  box-sizing: border-box;
}
#root {
  display: flex;
  flex-flow: column;
  overflow: hidden;
}

.Infinite {
  flex: 1;
}

body {
  background:rgb(35, 39, 47);
}`;

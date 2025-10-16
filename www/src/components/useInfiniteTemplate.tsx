// import raw from 'raw.macro';

import { SandpackFile } from '@codesandbox/sandpack-react';

export interface TemplateConfig {
  sandpackTemplate: 'react';
  sandpackTemplateFiles: Record<string, SandpackFile>;
  validCustomFileNames: string[];
}

export interface TemplateOptions {
  tailwind?: boolean;
}

const TAILWIND_CUSTOMIZATION = `<style type="text/tailwindcss">
  @theme {
    --color-foreground: var(--infinite-cell-color);
    --color-background: var(--infinite-background);
    --color-accent: var(--infinite-accent-color);
    --color-success: var(--infinite-success-color);
    --color-error: var(--infinite-error-color);
  }

/**
 * Make sure we put the 'infinite-table' layer before the tailwind 'components' layer,
 * so tailwind can override our styles.
 * 
 * But we need to put it before 'base', so the tailwind resets don't affect our component.
 */

@layer theme, base, infinite-table, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css" layer(utilities);
</style>`;

export const useInfiniteTemplate = (
  templateOptions?: TemplateOptions,
): TemplateConfig => {
  const validCustomFileNames = ['index.tsx', 'App.tsx', 'styles.css'];
  const sandpackTemplate = 'react';
  const sandpackTemplateFiles = getReactTemplateFiles(templateOptions);

  return {
    sandpackTemplate,
    validCustomFileNames,
    sandpackTemplateFiles,
  };
};
const getReactTemplateFiles = (
  options?: TemplateOptions,
): Record<string, SandpackFile> => {
  const inHead = options?.tailwind
    ? ` 
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
` // the script needs to be both here and in Sandpack.externalResources -
    : ``;

  const inBody = options?.tailwind ? TAILWIND_CUSTOMIZATION : '';
  const BASE_INDEX_HTML = `<!DOCTYPE html>
<html lang="en" >
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    ${inHead}
  </head>
  <body>
  ${inBody}
    <div id="root"></div>
    
  </body>
</html>`;

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

const BASE_FILE_REACT_APP = ``;

const BASE_FILE_REACT_INDEX = `
import * as React from 'react';
import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import '@infinite-table/infinite-react/index.css';

import App from './App';
import './styles.css';

//let's force dark mode on root
document.documentElement.classList.add('infinite-theme-mode--dark');

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

.Infinite {
  flex: 1;
}
  
#root {
  display: flex;
  flex-flow: column;
  overflow: hidden;
}


body {
  background:rgb(35, 39, 47);
}`;

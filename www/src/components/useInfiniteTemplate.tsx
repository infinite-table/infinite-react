// import raw from 'raw.macro';

import { SandpackFile } from '@codesandbox/sandpack-react';

export interface TemplateConfig {
  sandpackTemplate: 'react-ts';
  sandpackTemplateFiles: Record<string, SandpackFile>;
  validCustomFileNames: string[];
}

export const useInfiniteTemplate = (): TemplateConfig => {
  const validCustomFileNames = [
    'index.tsx',
    'App.tsx',
    'styles.css',
  ];
  const sandpackTemplate = 'react-ts';
  const sandpackTemplateFiles = getReactTemplateFiles();

  return {
    sandpackTemplate,
    validCustomFileNames,
    sandpackTemplateFiles,
  };
};
const getReactTemplateFiles = (): Record<
  string,
  SandpackFile
> => {
  return {
    '/src/App.tsx': {
      code: BASE_FILE_REACT_APP,
      active: true,
    },

    '/src/index.tsx': {
      code: BASE_FILE_REACT_INDEX,
      hidden: true,
    },
    '/src/styles.css': {
      code: BASE_FILE_REACT_STYLES,
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
const BASE_FILE_REACT_INDEX = `
import * as React from 'react';
import { render } from 'react-dom';

import '@infinite-table/infinite-react/index.css';

import App from './App';
import './styles.css';

render(<App />, document.getElementById('root'));

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
  padding: 5px;
  overflow: hidden;
}
.Infinite {
  flex: 1;
}

`;

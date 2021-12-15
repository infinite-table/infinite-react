import raw from 'raw.macro';
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
const BASE_PATH_REACT_PREFIX =
  '../code-snippets/base-react/src';
const BASE_FILE_REACT_APP = raw(
  `${BASE_PATH_REACT_PREFIX}/App.tsx`
);
const BASE_FILE_REACT_INDEX = raw(
  `${BASE_PATH_REACT_PREFIX}/index.tsx`
);
const BASE_FILE_REACT_STYLES = raw(
  `${BASE_PATH_REACT_PREFIX}/styles.css`
);

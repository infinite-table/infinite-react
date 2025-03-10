'use client';
import {
  SandpackProvider,
  SandpackSetup,
  SandpackFile,
} from '@codesandbox/sandpack-react';
import { SandpackFiles } from '@codesandbox/sandpack-react/dist/types/types';
import * as React from 'react';

import { useInfiniteTemplate } from '../../useInfiniteTemplate';

import { CustomPreset } from './CustomPreset';

const DEPS_VERSIONS: Record<string, string> = {
  '@infinite-table/infinite-react':
    (process.env.NEXT_PUBLIC_INFINITE_REACT_VERSION as string) || 'latest',
  'react-query': '3.35.0',
  'react-select': '5.4.0',
  'shadcn-ui-css-vars': '1.0.1',
  'ag-charts-react': '9.1.1',
  'ag-charts-community': '9.1.1',
  'devextreme-react': '21.2.6',
  devextreme: '21.2.6',
  'ag-grid-community': '27.1.0',
  'ag-grid-react': '27.1.0',
  'ag-grid-enterprise': '27.1.0',
  'react-sparklines': '1.7.0',
  '@progress/kendo-react-grid': '5.1.0',

  // for material date picker
  '@emotion/react': 'latest',
  '@emotion/styled': 'latest',
  '@mui/material': 'latest',
  '@mui/x-date-pickers': 'latest',
  dayjs: 'latest',
};

const VERSION_MAPPING: Record<string, string> = {
  prerelease: '0.x',
  latest: 'latest',
};

const INFINITE_VERSION_DETECTOR = /\@infinite-table\/infinite-react(\@\w+)/g;
/**
 *
 * Replaces custom version of infinite (needed for versioning blogposts)
 * with the default name
 */
function replaceCustomVersions(str: string) {
  return str.replaceAll(
    INFINITE_VERSION_DETECTOR,
    '@infinite-table/infinite-react',
  );
}

function getInfiniteVersion(code: string) {
  const matches = Array.from(code.matchAll(INFINITE_VERSION_DETECTOR)).map(
    (m) => m[1],
  );
  const version = (matches[0] || '').replace('@', '');

  if (version) {
    if (version.startsWith('v')) {
      return `${version.slice(1)}.x`;
    }
    return VERSION_MAPPING[version] || version;
  }

  return '';
}

type SandpackProps = {
  children: React.ReactChildren;
  deps?: string;
  version?: string;
  title?: React.ReactNode;
  autorun?: boolean;
  viewMode?: 'code' | 'preview' | 'both';
  size: 'default' | 'md' | 'lg';
  setup?: SandpackSetup;
};

function Sandpack(props: SandpackProps) {
  const { children, setup, autorun = true, title, size } = props;
  // console.log(props);
  const [resetKey, setResetKey] = React.useState(0);

  let modifiedInfiniteVersion: string | undefined;

  const isSandpackDescriptionElement = (el: React.ReactElement) => {
    //@ts-ignore
    return el.type?.name === 'Description';
  };

  const sandpackChildren = React.Children.toArray(
    //@ts-ignore
    children,
  ) as React.ReactElement[];
  const codeSnippets = sandpackChildren.filter(
    (el) => !isSandpackDescriptionElement(el),
  );
  const description = sandpackChildren.find(isSandpackDescriptionElement);

  const { sandpackTemplateFiles, validCustomFileNames } = useInfiniteTemplate();

  const dependencies: Record<string, string> = {
    '@infinite-table/infinite-react':
      props.version || DEPS_VERSIONS['@infinite-table/infinite-react'],
  };

  if (props.deps) {
    const deps: string[] = props.deps.split(',');

    deps.forEach((dep) => {
      if (!DEPS_VERSIONS[dep]) {
        console.warn(`Unknown dependency: ${dep}`);
        return;
      }
      dependencies[dep] = DEPS_VERSIONS[dep];
    });
  }

  let activeFilePath: string | null = null;

  let index = -1;
  const customFiles = codeSnippets.reduce(
    (result: Record<string, SandpackFile>, codeSnippet: React.ReactElement) => {
      // if (codeSnippet.props.mdxType !== 'pre') {
      //   return result;
      // }

      const { props } = codeSnippet.props.children;

      //@ts-ignore
      if (codeSnippet.type?.name === 'Description') {
        return result;
      }
      index++;

      let fileName = props.file;

      if (!fileName) {
        throw new Error(`Code block is missing a filename: ${props.children}`);
      }

      if (!validCustomFileNames.includes(fileName) && index === 0) {
        fileName = 'App.tsx';
        // throw new Error(`Code block has an unsupported filename: ${fileName}`);
      }

      const filePath = fileName.includes('index.html')
        ? `/public/index.html`
        : `/${fileName}`; // path in the folder structure
      const fileActive = index === 0;
      const fileHidden = props.hidden === 'true' || props.hidden === true;

      if (result[filePath]) {
        throw new Error(
          `File ${filePath} was defined multiple times. Each file snippet should have a unique name`,
        );
      }
      const initialCode = props.children as string;

      const code = replaceCustomVersions(initialCode);

      if (code != initialCode) {
        modifiedInfiniteVersion =
          modifiedInfiniteVersion || getInfiniteVersion(initialCode);
      }
      result[filePath] = {
        code,
        hidden: fileHidden,
        active: fileActive,
      };

      if (fileActive) {
        activeFilePath = filePath;
      }

      return result;
    },
    {},
  );

  if (modifiedInfiniteVersion) {
    dependencies['@infinite-table/infinite-react'] = modifiedInfiniteVersion;
  }

  const sandpackFiles: SandpackFiles = {
    ...sandpackTemplateFiles,
    ...customFiles,
  };

  let key = String(resetKey);
  if (process.env.NODE_ENV !== 'production') {
    // Remount on any source change in development.
    key +=
      '-' +
      JSON.stringify({
        ...props,
        children: sandpackFiles,
      });
  }

  const customSetup = {
    ...setup,
    dependencies,
    entry: '/index.tsx',
  };

  return (
    <div className="my-8" translate="no">
      <SandpackProvider
        key={key}
        template={'react-ts'}
        files={sandpackFiles}
        customSetup={customSetup}
        options={{
          activeFile: activeFilePath!,
          autorun,
          recompileMode: 'delayed',
          recompileDelay: 500,
        }}
      >
        <CustomPreset
          title={title}
          defaultHeight={
            size === 'default' || !size ? undefined : size === 'md' ? 650 : 850
          }
          defaultViewMode={
            props.viewMode === 'code'
              ? 'code'
              : props.viewMode === 'preview'
              ? 'preview'
              : 'both'
          }
          description={description}
          isSingleFile={false}
          onReset={() => {
            setResetKey((k) => k + 1);
          }}
        />
      </SandpackProvider>
    </div>
  );
}

Sandpack.displayName = 'Sandpack';

export default Sandpack;

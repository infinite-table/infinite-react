'use client';
import {
  SandpackProvider,
  SandpackSetup,
  SandpackFile,
  SandpackFiles,
} from '@codesandbox/sandpack-react';

import * as React from 'react';

import { useInfiniteTemplate } from '../../components/useInfiniteTemplate';

import { CustomPreset } from './CustomPreset';
import { SandpackInputFile } from './SandpackTypes';

const DEPS_VERSIONS: Record<string, string> = {
  '@infinite-table/infinite-react':
    (process.env.NEXT_PUBLIC_INFINITE_REACT_VERSION as string) || 'latest',
  '@thedatagrid/data': 'latest',

  // for material date picker
  '@emotion/react': 'latest',
  '@emotion/styled': 'latest',
  '@mui/material': 'latest',
  '@mui/x-date-pickers': 'latest',
  dayjs: 'latest',
};

type SandpackProps = {
  children?: React.ReactNode;
  files: SandpackInputFile[];
  deps?: string[];
  version?: string;
  title?: React.ReactNode;
  tailwind?: boolean;
  description?: React.ReactNode;
  autorun?: boolean;
  viewMode?: 'code' | 'preview' | 'both';
  size: 'default' | 'md' | 'lg';
  setup?: SandpackSetup;
};

function Sandpack(props: SandpackProps) {
  const { children, setup, autorun = true, title, size } = props;
  // console.log(props);
  const [resetKey, setResetKey] = React.useState(0);

  const isSandpackDescriptionElement = (el: React.ReactElement) => {
    //@ts-ignore
    return el.type?.name === 'Description';
  };

  const sandpackChildren = React.Children.toArray(
    //@ts-ignore
    children,
  ) as React.ReactElement[];

  const description =
    props.description || sandpackChildren.find(isSandpackDescriptionElement);

  const { sandpackTemplateFiles, validCustomFileNames } = useInfiniteTemplate({
    tailwind: props.tailwind,
  });

  const dependencies: Record<string, string> = {
    '@infinite-table/infinite-react':
      DEPS_VERSIONS['@infinite-table/infinite-react'],
  };

  if (props.deps) {
    const propsDeps =
      typeof props.deps === 'string' ? [props.deps] : props.deps;

    const deps: string[] = propsDeps || [];

    deps.forEach((dep) => {
      // if (!DEPS_VERSIONS[dep]) {
      //   console.warn(`Unknown dependency: ${dep}`);
      //   return;
      // }
      dependencies[dep] = DEPS_VERSIONS[dep] ?? 'latest';
    });
  }

  let activeFilePath: string | null = null;

  let index = -1;

  const customFiles = props.files.reduce(
    //@ts-ignore
    (
      result: Record<string, SandpackFile>,
      sandpackInputFile: SandpackInputFile,
    ) => {
      index++;

      let fileName = sandpackInputFile.name;
      const { code = '', hidden } = sandpackInputFile;

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
      const fileHidden = hidden === 'true' || hidden === true;

      if (result[filePath]) {
        throw new Error(
          `File ${filePath} was defined multiple times. Each file snippet should have a unique name`,
        );
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
          autoReload: true,
          recompileMode: 'delayed',
          recompileDelay: 500,
          externalResources: props.tailwind
            ? ['https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4']
            : [],
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

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
  '@infinite-table/infinite-react': process.env
    .NEXT_PUBLIC_INFINITE_REACT_VERSION as string,
  'react-query': '3.35.0',
  'react-select': '5.4.0',
  'devextreme-react': '21.2.6',
  devextreme: '21.2.6',
  'ag-grid-community': '27.1.0',
  'ag-grid-react': '27.1.0',
  'ag-grid-enterprise': '27.1.0',
  '@progress/kendo-react-grid': '5.1.0',
};

type SandpackProps = {
  children: React.ReactChildren;
  deps?: string;
  title?: React.ReactNode;
  autorun?: boolean;
  setup?: SandpackSetup;
};

function Sandpack(props: SandpackProps) {
  const { children, setup, autorun = true, title } = props;
  const [resetKey, setResetKey] = React.useState(0);

  const isSandpackDescriptionElement = (el: React.ReactElement) =>
    el.props.mdxType === 'Description';

  const sandpackChildren = React.Children.toArray(
    //@ts-ignore
    children,
  ) as React.ReactElement[];
  const codeSnippets = sandpackChildren.filter(
    (el) => !isSandpackDescriptionElement(el),
  );
  const description = sandpackChildren.find(isSandpackDescriptionElement);

  const { sandpackTemplateFiles, validCustomFileNames } = useInfiniteTemplate();

  const getMetaTag = (tag: string, metaTags: string[]): string | undefined => {
    const metaTag = metaTags?.find((metaTag) => metaTag.startsWith(`${tag}=`));
    if (!metaTag) {
      return;
    }
    const [, metaTagValue] = metaTag?.split(/=(.*)/);
    return metaTagValue;
  };

  let activeFilePath: string | null = null;
  const customFiles = codeSnippets.reduce(
    (
      result: Record<string, SandpackFile>,
      codeSnippet: React.ReactElement,
      index,
    ) => {
      if (codeSnippet.props.mdxType !== 'pre') {
        return result;
      }
      const { props } = codeSnippet.props.children;
      let metastring = props.metastring;
      const inline = !metastring;
      if (inline) {
        metastring = `file=App.tsx`;
      }

      const nodeMetaTags = metastring?.split(/\s+/);

      let fileName = getMetaTag('file', nodeMetaTags);

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
      const fileActive = index === 0; //!!getMetaTag('active', nodeMetaTags) || inline;
      const fileHidden = !!getMetaTag('hidden', nodeMetaTags);

      if (result[filePath]) {
        throw new Error(
          `File ${filePath} was defined multiple times. Each file snippet should have a unique name`,
        );
      }
      result[filePath] = {
        code: props.children as string,
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

  const dependencies: Record<string, string> = {
    '@infinite-table/infinite-react':
      DEPS_VERSIONS['@infinite-table/infinite-react'],
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

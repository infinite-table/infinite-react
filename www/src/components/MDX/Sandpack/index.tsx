import * as React from 'react';
import {
  SandpackProvider,
  SandpackSetup,
  SandpackFile,
} from '@codesandbox/sandpack-react';

import { CustomPreset } from './CustomPreset';
import { useInfiniteTemplate } from '../../useInfiniteTemplate';
import { SandpackFiles } from '@codesandbox/sandpack-react/dist/types/types';

const DEPS_VERSIONS: Record<string, string> = {
  '@infinite-table/infinite-react': '0.0.9',

  'react-query': '3.33.7',
};

type SandpackProps = {
  children: React.ReactChildren;
  deps?: string;
  title?: React.ReactNode;
  autorun?: boolean;
  setup?: SandpackSetup;
};

function Sandpack(props: SandpackProps) {
  let { children, setup, autorun = true, title } = props;
  let [resetKey, setResetKey] = React.useState(0);
  let codeSnippets = React.Children.toArray(
    children
  ) as React.ReactElement[];

  const { sandpackTemplateFiles, validCustomFileNames } =
    useInfiniteTemplate();

  const getMetaTag = (
    tag: string,
    metaTags: string[]
  ): string | undefined => {
    const metaTag = metaTags?.find((metaTag) =>
      metaTag.startsWith(`${tag}=`)
    );
    if (!metaTag) {
      return;
    }
    const [, metaTagValue] = metaTag?.split(/=(.*)/);
    return metaTagValue;
  };

  const customFiles = codeSnippets.reduce(
    (
      result: Record<string, SandpackFile>,
      codeSnippet: React.ReactElement,
      index
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
        throw new Error(
          `Code block is missing a filename: ${props.children}`
        );
      }

      if (
        !validCustomFileNames.includes(fileName) &&
        index === 0
      ) {
        fileName = 'App.tsx';
        // throw new Error(`Code block has an unsupported filename: ${fileName}`);
      }

      const filePath = `/src/${fileName}`; // path in the folder structure
      const fileActive = index === 0; //!!getMetaTag('active', nodeMetaTags) || inline;
      const fileHidden = !!getMetaTag(
        'hidden',
        nodeMetaTags
      );

      if (result[filePath]) {
        throw new Error(
          `File ${filePath} was defined multiple times. Each file snippet should have a unique name`
        );
      }
      result[filePath] = {
        code: props.children as string,
        hidden: fileHidden,
        active: fileActive,
      };

      return result;
    },
    {}
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

  return (
    <div className="my-8" translate="no">
      <SandpackProvider
        key={key}
        template={'react-ts'}
        customSetup={{
          ...setup,
          files: sandpackFiles,
          dependencies,
          entry: '/src/index.tsx',
          main: '/src/index.tsx',
        }}
        autorun={autorun}
        recompileMode={'delayed'}
        recompileDelay={500}>
        <CustomPreset
          title={title}
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

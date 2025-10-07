'use client';
import * as React from 'react';

import { atomDark } from '@codesandbox/sandpack-themes';
import cn from 'classnames';
import {
  SandpackCodeViewer,
  SandpackProvider,
  CodeEditorRef,
} from '@codesandbox/sandpack-react';

import { Mermaid as MermaidChart } from './Mermaid';

function Mermaid({ chart }: { chart: string }) {
  const [txt, setTxt] = React.useState('');

  React.useLayoutEffect(() => {
    if (globalThis.window) {
      setTxt(chart);
    }
  }, []);

  return txt ? (
    <div className="w-full">
      <MermaidChart text={txt} />
    </div>
  ) : null;
}

interface SyntaxHighlightProps {
  file: string;
  title: string;
  children: string;
  className?: string;
  highlightLines: number[];
  noMargin?: boolean;
  noMarkers?: boolean;
}

const SyntaxHighlight: React.ForwardRefExoticComponent<
  SyntaxHighlightProps & React.RefAttributes<CodeEditorRef>
> = React.forwardRef(function SyntaxHighlightFn(
  {
    children,
    className = 'language-js',
    highlightLines,
    title,
    noMargin,
  }: SyntaxHighlightProps,
  ref?: React.Ref<CodeEditorRef>,
) {
  const getDecoratedLineInfo = () => {
    const linesToHighlight = highlightLines || [];

    const highlightedLineConfig = linesToHighlight.map((line) => {
      return {
        className: 'bg-datagrid-purple/50',
        line: Number(line),
      };
    });

    return highlightedLineConfig;
  };

  // e.g. "language-js"
  const language = className.substring(9);
  const filename = '/index.' + language;
  const decorators = getDecoratedLineInfo();

  // const title = getTitle(metastring);
  const hasTitle = !!title;
  const titleBlock = hasTitle ? (
    <div
      className={cn(
        'leading-base bg-dark-custom w-full rounded-t-lg',
        !noMargin && 'mt-8',
      )}
    >
      <div className="text-primary-dark flex text-base px-4 py-0.5 relative">
        ICON {title}
      </div>
    </div>
  ) : null;

  let el: React.JSX.Element | null = null;

  if (language === 'mmd') {
    el = <Mermaid chart={children.trimEnd()} />;
  } else if (children) {
    el = (
      <SandpackProvider
        template="react"
        theme={atomDark}
        customSetup={{
          entry: filename,
        }}
        options={{
          activeFile: filename,
        }}
        files={{
          [filename]: {
            code: children.trimEnd(),
          },
        }}
      >
        <SandpackCodeViewer
          ref={ref}
          showLineNumbers={false}
          decorators={decorators}
        />
      </SandpackProvider>
    );
  }

  const style = hasTitle
    ? {
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
      }
    : {};

  // @ts-ignore
  style['--sp-colors-surface1'] = 'transparent';
  return (
    <>
      {titleBlock}
      <div
        translate="no"
        style={style}
        className={cn(
          ` h-full w-full overflow-x-auto  items-center SyntaxHighlight `,
        )}
      >
        {el}
      </div>
    </>
  );
});

export default SyntaxHighlight;

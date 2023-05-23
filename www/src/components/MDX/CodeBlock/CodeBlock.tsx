'use client';
import {
  ClasserProvider,
  // Sandpack,
  SandpackCodeViewer,
  SandpackProvider,
  SandpackThemeProvider,
} from '@codesandbox/sandpack-react';
import { CodeMirrorRef } from '@codesandbox/sandpack-react/dist/types/components/CodeEditor/CodeMirror';
import { IconCodeBlock } from '@www/components/Icon/IconCodeBlock';
import cn from 'classnames';

// import rangeParser from 'parse-numeric-range';
import * as React from 'react';

//@ts-ignore
// import { Mermaid as MermaidChart } from 'mdx-mermaid/lib/Mermaid'; //eslint-disable-line
// import { Mermaid as MermaidChart } from 'mdx-mermaid/lib/Mermaid'; //eslint-disable-line

import { Mermaid as MermaidChart } from './Mermaid';

// import { CustomTheme } from '../Sandpack/Themes';

// import styles from './CodeBlock.module.css';

// interface InlineHiglight {
//   step: number;
//   line: number;
//   startColumn: number;
//   endColumn: number;
// }

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

const CodeBlock = React.forwardRef(function CodeBlockFn(
  {
    children,
    className = 'language-js',
    highlightLines,

    title,
    noMargin,
  }: {
    file: string;
    title: string;
    children: string;
    className?: string;
    highlightLines: string; // string with comma separated numbers
    noMargin?: boolean;
    noMarkers?: boolean;
  },
  ref?: React.Ref<CodeMirrorRef>,
) {
  const getDecoratedLineInfo = () => {
    // if (!metastring) {
    //   return [];
    // }

    const linesToHighlight = highlightLines ? highlightLines.split(',') : [];

    const highlightedLineConfig = linesToHighlight.map((line) => {
      return {
        className: 'bg-github-highlight bg-opacity-10',
        line: Number(line),
      };
    });

    // const inlineHighlightLines = []; // TODO no longer supported
    // const inlineHighlightLines = getInlineHighlights(metastring, children);
    // const inlineHighlightConfig = inlineHighlightLines.map(
    //   (line: InlineHiglight) => ({
    //     ...line,
    //     elementAttributes: {
    //       'data-step': `${line.step}`,
    //     },
    //     className: cn('code-step bg-opacity-10 relative rounded-md p-1 ml-2', {
    //       'pl-3 before:content-[attr(data-step)] before:block before:w-4 before:h-4 before:absolute before:top-1 before:-left-2 before:rounded-full before:text-white before:text-center before:text-xs before:leading-4':
    //         !noMarkers,
    //       'bg-blue-40 before:bg-blue-40': line.step === 1,
    //       'bg-yellow-40 before:bg-yellow-40': line.step === 2,
    //       'bg-green-40 before:bg-green-40': line.step === 3,
    //       'bg-purple-40 before:bg-purple-40': line.step === 4,
    //     }),
    //   }),
    // );

    return highlightedLineConfig; //.concat(inlineHighlightConfig);
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
        <IconCodeBlock className="inline-flex mr-2 self-center" /> {title}
      </div>
    </div>
  ) : null;

  let el: JSX.Element | null = null;
  if (language === 'mmd') {
    el = <Mermaid chart={children.trimEnd()} />;
  } else if (children) {
    el = (
      <SandpackProvider
        template="react"
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
        {/* <SandpackThemeProvider theme={CustomTheme}> */}
        <SandpackThemeProvider theme={'dark'}>
          <ClasserProvider
            classes={
              {
                // 'sp-cm': styles.codeViewer,
              }
            }
          >
            <SandpackCodeViewer
              ref={ref}
              showLineNumbers={false}
              decorators={decorators}
            />
          </ClasserProvider>
        </SandpackThemeProvider>
      </SandpackProvider>
    );
  }
  return (
    <>
      {titleBlock}
      <div
        translate="no"
        style={
          hasTitle
            ? {
                borderTopRightRadius: 0,
                borderTopLeftRadius: 0,
              }
            : {}
        }
        className={cn(
          'rounded-lg h-full w-full overflow-x-auto flex items-center  shadow-lg',
          !noMargin && (hasTitle ? 'mb-8' : 'my-8'),
        )}
      >
        {el}
      </div>
    </>
  );
});

export default CodeBlock;

/**
 *
 * @param metastring string provided after the language in a markdown block
 * @returns array of lines to highlight
 * @example
 * ```js {1-3,7} [[1, 1, 20, 33], [2, 4, 4, 8]] App.js active
 * ...
 * ```
 *
 * -> The metastring is `{1-3,7} [[1, 1, 20, 33], [2, 4, 4, 8]] App.js active`
 */
// function getHighlightLines(metastring: string): number[] {
//   const HIGHLIGHT_REGEX = /{([\d,-]+)}/;
//   const parsedMetastring = HIGHLIGHT_REGEX.exec(metastring);
//   if (!parsedMetastring) {
//     return [];
//   }
//   return rangeParser(parsedMetastring[1]);
// }

// function getTitle(metastring: string): string {
//   const metatags = metastring?.split(/\s+/);

//   const metaTag = metatags?.find((metaTag) => metaTag.startsWith(`title=`));

//   const [_, titleValue] = metaTag?.split(/=(.*)/) || [];
//   if (titleValue) {
//     return titleValue.replaceAll('_', ' ').replaceAll('-', ' ');
//   }

//   return '';
// }

/**
 * // TODO remove as no longer supported
 *
 * @param metastring string provided after the language in a markdown block
 * @returns InlineHighlight[]
 * @example
 * ```js {1-3,7} [[1, 1, 'count'], [2, 4, 'setCount']] App.js active
 * ...
 * ```
 *
 * -> The metastring is `{1-3,7} [[1, 1, 'count', [2, 4, 'setCount']] App.js active`
 */
// function getInlineHighlights(metastring: string, code: string) {
//   const INLINE_HIGHT_REGEX = /(\[\[.*\]\])/;
//   const parsedMetastring = INLINE_HIGHT_REGEX.exec(metastring);
//   if (!parsedMetastring) {
//     return [];
//   }

//   const lines = code.split('\n');
//   const encodedHiglights = JSON.parse(parsedMetastring[1]);
//   return encodedHiglights.map(([step, lineNo, substr, fromIndex]: any[]) => {
//     const line = lines[lineNo - 1];
//     let index = line.indexOf(substr);
//     const lastIndex = line.lastIndexOf(substr);
//     if (index !== lastIndex) {
//       if (fromIndex === undefined) {
//         throw Error(
//           "Found '" +
//             substr +
//             "' twice. Specify fromIndex as the fourth value in the tuple.",
//         );
//       }
//       index = line.indexOf(substr, fromIndex);
//     }
//     if (index === -1) {
//       throw Error("Could not find: '" + substr + "'");
//     }
//     return {
//       step,
//       line: lineNo,
//       startColumn: index,
//       endColumn: index + substr.length,
//     };
//   });
// }

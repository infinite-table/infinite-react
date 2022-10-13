import {
  useSandpack,
  useActiveCode,
  SandpackCodeEditor,
  SandpackThemeProvider,
  SandpackLayout,
} from '@codesandbox/sandpack-react';
import { IconChevron } from '@www/components/Icon/IconChevron';
import { IconCodeBlock } from '@www/components/Icon/IconCodeBlock';
import * as React from 'react';
// @ts-ignore
import { CSSProperties } from 'react';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import scrollIntoView from 'scroll-into-view-if-needed';

import { NavigationBar } from './NavigationBar';
import { Preview } from './Preview';
import { CustomTheme } from './Themes';

export function CustomPreset({
  isSingleFile,
  title,
  description,
  onReset,
}: {
  description?: React.ReactNode;
  title?: React.ReactNode;
  isSingleFile: boolean;
  onReset: () => void;
}) {
  const lineCountRef = React.useRef<{
    [key: string]: number;
  }>({});
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { listen, sandpack } = useSandpack();

  const [viewMode, setViewMode] = useState<'code' | 'preview' | 'both'>('both');

  const previousViewModeRef = React.useRef(viewMode);

  React.useEffect(() => {
    const prevViewMode = previousViewModeRef.current;

    if (prevViewMode === 'code') {
      const rafId = requestAnimationFrame(() => {
        sandpack.runSandpack();
      });

      return () => {
        cancelAnimationFrame(rafId);
      };
    }
  }, [viewMode]);

  React.useEffect(() => {
    previousViewModeRef.current = viewMode;
  }, [viewMode]);

  const showCode = viewMode === 'code' || viewMode === 'both';
  const showPreview = viewMode === 'preview' || viewMode === 'both';

  // useEffect(() => {
  //   const unsubscribe = listen((msg) => {
  //     //msg here could also be from code
  //     console.log(msg);
  //   });

  //   return () => unsubscribe();
  // }, []);

  const { code } = useActiveCode();
  const [_isExpanded, setIsExpanded] = React.useState(false);

  let isExpanded = _isExpanded;

  const { activeFile } = sandpack;
  const activePath = activeFile;
  if (!lineCountRef.current[activePath]) {
    lineCountRef.current[activePath] = code.split('\n').length;
  }
  const lineCount = lineCountRef.current[activePath];
  let isExpandable = lineCount > 16 || isExpanded;
  let editorHeight = isExpandable ? lineCount * 24 + 24 : 'auto'; // shown lines * line height (24px)

  const titleBlock = title ? (
    <div
      className={'leading-base bg-gray-90 dark:bg-gray-60 w-full rounded-t-lg'}
    >
      <div className="text-primary-dark dark:text-primary-dark flex text-sm px-4 py-0.5 relative">
        <IconCodeBlock className="inline-flex mr-2 self-center" /> {title}
      </div>
    </div>
  ) : null;

  const [fullScreen, setFullScreen] = React.useState(false);

  if (fullScreen) {
    editorHeight = 'auto';
    isExpandable = false;
    isExpanded = true;
  }

  const getHeight = () => {
    if (fullScreen) {
      const diff = 40 + (titleBlock ? 34 : 0); // 40 is navbar height
      return `calc(100vh - ${diff}px)`;
    }
    if (!isExpandable) {
      return editorHeight;
    }
    return isExpanded ? editorHeight : 406;
  };

  const descriptionBlock = description ? (
    <div
      className={
        'leading-base bg-card dark:bg-card-dark w-full border-b border-border dark:border-gray-60'
      }
    >
      <div className="sandpackDescription text-primary dark:text-primary-dark text-sm px-4 py-0.5 relative">
        {description}
      </div>
    </div>
  ) : null;
  return (
    <>
      <div
        className="shadow-lg dark:shadow-lg-dark rounded-lg overflow-hidden"
        ref={containerRef}
        style={
          fullScreen
            ? ({
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                top: 0,
                zIndex: 1000,
              } as CSSProperties)
            : undefined
        }
      >
        {titleBlock}
        {!fullScreen && descriptionBlock}
        <NavigationBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          skipRound={!!titleBlock || !!descriptionBlock}
          showDownload={isSingleFile}
          onReset={onReset}
          onFullScreenToggle={setFullScreen}
        />

        {/* <SandpackThemeProvider theme={CustomTheme}> */}
        <SandpackThemeProvider>
          <div
            ref={sandpack.lazyAnchorRef}
            className=" rounded-t-none"
            style={{
              // Prevent it from collapsing below the initial (non-loaded) height.
              // There has to be some better way to do this...
              minHeight: 216,
              height: fullScreen ? '100vh' : 'auto',
            }}
          >
            <SandpackLayout>
              {showCode ? (
                <SandpackCodeEditor
                  style={{
                    height: getHeight(),
                    maxHeight: isExpanded
                      ? fullScreen
                        ? getHeight()
                        : ''
                      : 406, //40px is navbar height
                  }}
                  showLineNumbers
                  showInlineErrors
                  showTabs={false}
                />
              ) : null}
              {showPreview ? (
                <Preview
                  isExpanded={isExpanded}
                  fullScreen={fullScreen}
                  className="order-last xl:order-2"
                  customStyle={{
                    height: getHeight(),
                    minHeight: getHeight(),
                    maxHeight: isExpanded ? '' : 406,
                  }}
                />
              ) : null}
              {isExpandable && (
                <button
                  translate="yes"
                  className="flex text-base justify-between dark:border-card-dark bg-wash dark:bg-card-dark items-center z-10 rounded-t-none p-1 w-full order-2 xl:order-last border-b-1 relative top-0"
                  onClick={() => {
                    const nextIsExpanded = !isExpanded;
                    flushSync(() => {
                      setIsExpanded(nextIsExpanded);
                    });
                    if (!nextIsExpanded && containerRef.current !== null) {
                      scrollIntoView(containerRef.current, {
                        scrollMode: 'if-needed',
                        block: 'nearest',
                        inline: 'nearest',
                      });
                    }
                  }}
                >
                  <span className="flex p-2 focus:outline-none text-primary dark:text-primary-dark">
                    <IconChevron
                      className="inline mr-1.5 text-xl"
                      displayDirection={isExpanded ? 'up' : 'down'}
                    />
                    {isExpanded ? 'Show less' : 'Show more'}
                  </span>
                </button>
              )}
            </SandpackLayout>
          </div>
        </SandpackThemeProvider>
      </div>
    </>
  );
}

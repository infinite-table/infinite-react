'use client';
import {
  useSandpack,
  useActiveCode,
  SandpackCodeEditor,
  SandpackThemeProvider,
  SandpackLayout,
} from '@codesandbox/sandpack-react';

import { IconChevron } from '@www/components/icons/IconChevron';

import * as React from 'react';

import { CSSProperties } from 'react';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import scrollIntoView from 'scroll-into-view-if-needed';

import { NavigationBar } from './NavigationBar';
import { Preview } from './Preview';
import { TitleBlock } from './TitleBlock';

const DEFAULT_MAX_HEIGHT = '90vh';
export function CustomPreset({
  isSingleFile,
  title,
  description,
  onReset,
  defaultHeight,
  defaultViewMode,
}: {
  defaultViewMode?: 'code' | 'preview' | 'both';
  defaultHeight?: number;
  description?: React.ReactNode;
  title?: React.ReactNode;
  isSingleFile: boolean;
  onReset: () => void;
}) {
  const THE_HEIGHT = defaultHeight ?? 406;
  const lineCountRef = React.useRef<{
    [key: string]: number;
  }>({});
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { sandpack } = useSandpack();

  const [viewMode, setViewMode] = useState<'code' | 'preview' | 'both'>(
    defaultViewMode ?? 'both',
  );

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
    return;
  }, [viewMode]);

  React.useEffect(() => {
    previousViewModeRef.current = viewMode;
  }, [viewMode]);

  const showCode = viewMode === 'code' || viewMode === 'both';
  const showPreview = viewMode === 'preview' || viewMode === 'both';

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

  const [fullScreen, doSetFullScreen] = React.useState(false);

  const setFullScreen = (value: boolean) => {
    doSetFullScreen(value);
    // for whatever reason, when going out of full screen,
    // the height of the editor is not updated correctly
    // and this fixes it
    requestAnimationFrame(() => {
      setIsExpanded(value);
    });
  };
  const titleBlock = title ? (
    <TitleBlock className={fullScreen ? '' : 'bg-opacity-50'}>
      {title}
    </TitleBlock>
  ) : null;

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
    const adjustedEditorHeight = `clamp(200px,${editorHeight}px, ${DEFAULT_MAX_HEIGHT})`;
    if (!isExpandable) {
      return adjustedEditorHeight;
    }
    return isExpanded ? adjustedEditorHeight : THE_HEIGHT;
  };

  if (Array.isArray(description) && !description.length) {
    description = null;
  }

  const descriptionBlock = description ? (
    <div className={'leading-base w-full border-b border-gray-60 '}>
      <div
        className={`sandpackDescription pb-4 text-content-color text-base px-4 border-b-transparent border-b-1 relative [--text-paragraph:var(--text-base)]`}
      >
        {description}
      </div>
    </div>
  ) : null;

  const codeEditorHeight = getHeight();
  return (
    <>
      <div
        className="shadow-lgdark rounded-md overflow-hidden border-1"
        ref={containerRef}
        style={
          fullScreen
            ? ({
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                top: 0,
                zIndex: 10000,
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
            className="rounded-t-none"
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
                    height: codeEditorHeight,
                    maxHeight: isExpanded
                      ? fullScreen
                        ? codeEditorHeight
                        : DEFAULT_MAX_HEIGHT
                      : THE_HEIGHT, //40px is navbar height
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
                  customStyle={{
                    height: codeEditorHeight,
                    minHeight: codeEditorHeight,
                    maxHeight: isExpanded ? DEFAULT_MAX_HEIGHT : THE_HEIGHT,
                  }}
                />
              ) : null}
              {isExpandable && (
                <button
                  translate="yes"
                  className="bg-gray-800 text-primary-dark flex text-base justify-between items-center z-10 rounded-t-none p-1 w-full relative top-0"
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
                  <span className="p-2 focus:outline-hidden text-accent inline-flex rounded-md cursor-pointer hover:bg-gray-700">
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

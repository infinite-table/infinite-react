import { FileTabs, useSandpack } from '@codesandbox/sandpack-react';
import { IconCode } from '@www/components/Icon/IconCode';
import { IconCodeAndPreview } from '@www/components/Icon/IconCodeAndPreview';
import { IconPreview } from '@www/components/Icon/IconPreview';
import * as React from 'react';

import { DownloadButton } from './DownloadButton';
import { FilesDropdown } from './FilesDropdown';
import { FullScreenButton } from './FullScreenButton';
import { OpenInCodeSandboxButton } from './OpenInCodeSandboxButton';
import { ResetButton } from './ResetButton';

export type ViewMode = 'code' | 'preview' | 'both';
export function NavigationBar({
  showDownload,
  onReset,
  onFullScreenToggle,
  skipRound,
  viewMode,
  onViewModeChange,
}: {
  viewMode: ViewMode;
  onViewModeChange?: (viewMode: ViewMode) => void;
  skipRound?: boolean;
  showDownload: boolean;
  onReset: () => void;
  onFullScreenToggle?: (fullScreen: boolean) => void;
}) {
  const { sandpack } = useSandpack();
  const [dropdownActive, setDropdownActive] = React.useState(false);
  const { visibleFiles: openPaths } = sandpack;

  const resizeHandler = React.useCallback(() => {
    const width = window.innerWidth || document.documentElement.clientWidth;
    if (!dropdownActive && width < 640) {
      setDropdownActive(true);
    }
    if (dropdownActive && width >= 640) {
      setDropdownActive(false);
    }
  }, [dropdownActive]);

  React.useEffect(() => {
    if (openPaths.length > 1) {
      resizeHandler();
      window.addEventListener('resize', resizeHandler);
      return () => {
        window.removeEventListener('resize', resizeHandler);
      };
    }
    return;
  }, [openPaths.length, resizeHandler]);

  const viewModeButtonClassName =
    'appearance-none flex flex-row justify-center items-center flex-nowrap whitespace-nowrap dark:text-primary-dark hover:text-wash hover:bg-primary hover:dark:text-wash-dark text-primary h-full flex-1 px-3';

  const activeViewModeClassName = 'text-wash bg-primary dark:text-primary-dark';
  return (
    <div
      className={`bg-dark-custom flex justify-between items-center relative z-10 border-b border-border-dark rounded-b-none ${
        skipRound ? '' : 'rounded-t-lg'
      }`}
    >
      <div className="px-4 lg:px-6">
        {dropdownActive ? <FilesDropdown /> : <FileTabs />}
      </div>
      <div
        className="px-3 flex items-center justify-end flex-grow text-right"
        translate="yes"
      >
        {showDownload && <DownloadButton />}
        {/* <OpenInWindowButton onClick={() => {}} /> */}
        <div
          className="flex flex-row ma-2 relative mr-5 text-sm items-center text-content-color"
          style={{ width: 250 }}
        >
          View Mode
          <div className=" ml-3 flex flex-row items-center border border-secondary rounded-md flex-1 overflow-hidden">
            <button
              className={
                viewModeButtonClassName +
                ' ' +
                (viewMode === 'code' && activeViewModeClassName)
              }
              title="Only Code"
              onClick={() => {
                onViewModeChange?.('code');
              }}
            >
              <IconCode />
            </button>
            <button
              className={
                viewModeButtonClassName +
                ' ' +
                (viewMode === 'both' && activeViewModeClassName)
              }
              title="Code + Preview"
              onClick={() => {
                onViewModeChange?.('both');
              }}
            >
              <IconCodeAndPreview />
            </button>
            <button
              className={
                viewModeButtonClassName +
                ' ' +
                (viewMode === 'preview' && activeViewModeClassName)
              }
              title="Only Preview"
              onClick={() => {
                onViewModeChange?.('preview');
              }}
            >
              <IconPreview />
            </button>
          </div>
          <div className="pointer-events-none  absolute h-full w-full left-0 top-0" />
        </div>
        <FullScreenButton onToggle={onFullScreenToggle} />
        <ResetButton onReset={onReset} />
        <OpenInCodeSandboxButton className="ml-2 md:ml-4" />
      </div>
    </div>
  );
}

import { FileTabs, useSandpack } from '@codesandbox/sandpack-react';
import { IconCode } from '@www/components/icons/IconCode';
import { IconCodeAndPreview } from '@www/components/icons/IconCodeAndPreview';
import { IconPreview } from '@www/components/icons/IconPreview';
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
    'cursor-pointer appearance-none flex flex-row border-left-1 justify-center items-center flex-nowrap whitespace-nowrap  hover:opacity-100 rounded-sm hover:bg-gray-700 text-content-color h-full flex-1 px-2 opacity-50';

  const activeViewModeClassName = 'text-white opacity-100!';
  return (
    <div
      className={`bg-gray-900 flex justify-between items-center relative z-10  rounded-b-none ${
        skipRound ? '' : 'rounded-t-lg'
      }`}
    >
      <div className="px-0 lg:px-2">
        {dropdownActive ? <FilesDropdown /> : <FileTabs />}
      </div>
      <div
        className="px-3 flex items-center justify-end grow text-right text-textcolorpale"
        translate="yes"
      >
        {showDownload && <DownloadButton />}
        {/* <OpenInWindowButton onClick={() => {}} /> */}
        <div className="flex flex-row ma-2 relative mr-5 text-sm items-center text-textcolorpale">
          View Mode
          <div className=" ml-3 flex flex-row items-center bg-gray-800 rounded-md flex-1 overflow-hidden py-1 px-1">
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

import { IconSearch } from '@www/components/Icon/IconSearch';
import Script from 'next/script';

import * as React from 'react';

// import {} from '/_pagefind/pagefind.js'

export interface PageFindSearchProps {
  // appId?: string;
  // apiKey?: string;
  // indexName?: string;
  // searchParameters?: any;
  // renderModal?: boolean;
  alwaysShow?: boolean;
}

const initMap: Record<string, boolean> = {};

export const PageFindSearch: React.FC<PageFindSearchProps> = (
  { alwaysShow }: PageFindSearchProps = { alwaysShow: false },
) => {
  const id = React.useId().replaceAll(':', '-');
  const [isShowing, setIsShowing] = React.useState(alwaysShow || false);

  const onOpen = React.useCallback(() => {
    setIsShowing(true);
  }, [setIsShowing, alwaysShow]);

  const onClose = React.useCallback(
    function onClose() {
      if (alwaysShow) {
        return;
      }
      setIsShowing(false);
    },
    [setIsShowing, alwaysShow],
  );

  React.useEffect(() => {
    function onBlur() {
      requestAnimationFrame(() => {
        onClose();
      });
    }
    if (isShowing && !alwaysShow) {
      let inputField: HTMLInputElement | null = null;

      requestAnimationFrame(() => {
        const input = document.querySelector(
          `#${id} .pagefind-ui__search-input`,
        ) as HTMLInputElement;

        if (input) {
          input.focus();

          if (inputField) {
            return;
          }
          input.addEventListener('blur', onBlur);
          inputField = input;
        }
      });

      return () => {
        if (inputField) {
          inputField.removeEventListener('blur', onBlur);
        }
      };
    }
  }, [isShowing, alwaysShow]);

  React.useEffect(() => {
    function waitFor(fn: Function, callback: VoidFunction, timeout = 30) {
      if (!fn()) {
        setTimeout(function () {
          waitFor(fn, callback, timeout);
        }, timeout || 100);
        return;
      }
      callback();
    }

    waitFor(
      function () {
        // @ts-ignore
        return !!window.PagefindUI;
      },
      function () {
        const initialized = initMap[id];

        if (initialized) {
          return;
        }
        initMap[id] = true;

        // console.log('init pagefind', id, document.querySelector('#' + id));
        // @ts-ignore
        new PagefindUI({
          element: `#${id}`,
          resetStyles: false,
          showImages: false,
          processResult: function (result: any) {
            result.url = result.url.replace('.html', '');
            return result;
          },
        });
      },
    );
  });

  return (
    <>
      {/* button for top-right of the page */}
      {alwaysShow ? null : (
        <button
          type="button"
          className={`inline-flex items-center text-lg p-1 ml-0 lg:ml-6 ${
            isShowing ? 'hidden' : ''
          }`}
          onClick={onOpen}
        >
          <IconSearch className="align-middle" />
        </button>
      )}

      {/* button for the sidebar of the page */}
      {/* <button
        type="button"
        className="hidden  relative pl-4 pr-0.5 py-1 h-10 bg-gray-80 outline-none focus:ring focus:outline-none betterhover:hover:bg-opacity-80 pointer items-center shadow-inner text-left w-full text-gray-30 rounded-lg align-middle text-sm"
        onClick={onOpen}
      >
        <IconSearch className="mr-3 align-middle text-gray-30 flex-shrink-0 group-betterhover:hover:text-gray-70" />
        Search
        <span className="ml-auto hidden sm:flex item-center">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button> */}

      <>
        <div
          id={id}
          className={`${isShowing ? 'visible' : 'invisible w-0'}`}
        ></div>
      </>
    </>
  );
};

PageFindSearch.displayName = 'PageFindSearch';

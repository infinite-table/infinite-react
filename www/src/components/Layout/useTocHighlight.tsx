import * as React from 'react';

/** How far below the place a heading scrolls to (when its link is clicked) it still counts as reached. */
const SLACK = 10;
const BOTTOM_OFFSET = 75;

/**
 * The headings the table of contents links (`#its-id`) point to; `null` for
 * `#`, the top of the page. Two headings with the same text have the same
 * id: the second link is then matched with the second heading.
 */
function headingsOf(urls: string[]): (Element | null)[] {
  const seen = new Map<string, number>();
  return urls.map((url) => {
    const id = decodeURIComponent(url.slice(url.indexOf('#') + 1));
    if (!id) {
      return null;
    }
    const nth = seen.get(id) ?? 0;
    seen.set(id, nth + 1);
    return document.querySelectorAll(`[id="${CSS.escape(id)}"]`)[nth] ?? null;
  });
}

/**
 * The index of the table of contents entry for the section being read: the
 * last heading scrolled to or past the top of the page (below the header).
 *
 * @param urls the links of the table of contents, in order
 */
export function useTocHighlight(urls: string[]) {
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const key = urls.join('\n');

  React.useEffect(() => {
    const urls = key ? key.split('\n') : [];
    let timeoutId: number | null = null;

    function updateActiveLink() {
      const pageHeight = document.documentElement.scrollHeight;
      const scrollBottom = window.scrollY + window.innerHeight;

      if (window.scrollY > 0 && pageHeight - scrollBottom <= BOTTOM_OFFSET) {
        // scrolled to the bottom of the page
        setCurrentIndex(urls.length - 1);
        return;
      }

      // a clicked link scrolls its heading to this distance from the top
      const threshold =
        (parseFloat(
          getComputedStyle(document.documentElement).scrollPaddingTop,
        ) || 0) + SLACK;

      let index = 0;
      headingsOf(urls).forEach((heading, i) => {
        if (heading && heading.getBoundingClientRect().top <= threshold) {
          index = i;
        }
      });
      setCurrentIndex(index);
    }

    function throttledUpdateActiveLink() {
      if (timeoutId === null) {
        timeoutId = window.setTimeout(() => {
          timeoutId = null;
          updateActiveLink();
        }, 100);
      }
    }

    window.addEventListener('scroll', throttledUpdateActiveLink, {
      passive: true,
    });
    window.addEventListener('resize', throttledUpdateActiveLink);

    updateActiveLink();

    return () => {
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('scroll', throttledUpdateActiveLink);
      window.removeEventListener('resize', throttledUpdateActiveLink);
    };
  }, [key]);

  return {
    currentIndex,
  };
}

import { getGlobal } from '../../utils/getGlobal';

let scrollbarWidth: number;

export function getScrollbarWidth(): number {
  if (scrollbarWidth != null) {
    return scrollbarWidth;
  }

  const doc = getGlobal().document ?? null;

  if (!doc) {
    return 0;
  }

  const outer = doc.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  doc.body.appendChild(outer);

  // Creating inner element and placing it in the container
  const inner = doc.createElement('div');
  outer.appendChild(inner);

  // Calculating difference between container's full width and the child width
  scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

  outer.parentNode?.removeChild(outer);

  return scrollbarWidth;
}

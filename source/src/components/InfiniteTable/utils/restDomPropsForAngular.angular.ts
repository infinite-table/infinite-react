/**
 * The props of `domProps` that the Angular root doesn't bind itself (class,
 * style, tabIndex, autoFocus and the keydown handler are merged by the root,
 * like React's useDOMProps does): attributes (`id`, `title`, `data-*`,
 * `aria-*`, `role`...) and `on*` event handlers, put on the root element as
 * React and Vue spread them there.
 */
const HANDLED_BY_THE_ROOT = new Set([
  'className',
  'class',
  'style',
  'tabIndex',
  'autoFocus',
  'onKeyDown',
  'onKeydown',
  'children',
  'ref',
]);

/** React event prop names whose DOM event name isn't just the lowercased rest */
const EVENT_NAMES: Record<string, string> = {
  doubleclick: 'dblclick',
};

const ATTRIBUTE_NAMES: Record<string, string> = {
  htmlFor: 'for',
};

function eventOf(key: string): { name: string; capture: boolean } | null {
  if (!/^on[A-Z]/.test(key)) {
    return null;
  }
  let name = key.slice(2);
  const capture = name.endsWith('Capture');
  if (capture) {
    name = name.slice(0, -'Capture'.length);
  }
  const lower = name.toLowerCase();
  return { name: EVENT_NAMES[lower] ?? lower, capture };
}

export function createRestDomPropsApplier(element: HTMLElement) {
  let attributes: string[] = [];
  let listeners: {
    name: string;
    capture: boolean;
    listener: EventListener;
  }[] = [];

  const clear = () => {
    attributes.forEach((name) => element.removeAttribute(name));
    listeners.forEach(({ name, capture, listener }) =>
      element.removeEventListener(name, listener, capture),
    );
    attributes = [];
    listeners = [];
  };

  return {
    /** applies `domProps` (and removes what the previous ones applied) */
    update(domProps: Record<string, any> | null | undefined) {
      clear();
      if (!domProps) {
        return;
      }
      for (const key in domProps) {
        if (HANDLED_BY_THE_ROOT.has(key)) {
          continue;
        }
        const value = domProps[key];
        const event = eventOf(key);
        if (event) {
          if (typeof value === 'function') {
            const listener = value as EventListener;
            element.addEventListener(event.name, listener, event.capture);
            listeners.push({ ...event, listener });
          }
          continue;
        }
        if (value == null || value === false || typeof value === 'function') {
          continue;
        }
        const name = ATTRIBUTE_NAMES[key] ?? key;
        element.setAttribute(name, value === true ? '' : String(value));
        attributes.push(name);
      }
    },
  };
}

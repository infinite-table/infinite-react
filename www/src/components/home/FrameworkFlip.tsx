'use client';

import * as React from 'react';

// The last word repeats the first, so the roll can snap back to the start
// without a visible jump.
const WORDS = ['React', 'Angular', 'Vue', 'React'];

const HOLD_MS = 2400;
const ROLL_MS = 600;

/**
 * The framework name in the hero headline, rolling like a billboard:
 * React → Angular → Vue → React, then a pause and again.
 * Screen readers (and reduced-motion users) get a plain "React".
 */
export function FrameworkFlip() {
  const slotRef = React.useRef<HTMLSpanElement>(null);
  const [index, setIndex] = React.useState(0);
  const [animate, setAnimate] = React.useState(true);
  const [widths, setWidths] = React.useState<number[] | null>(null);

  // Measure every word, so the slot can resize to the one in view.
  React.useLayoutEffect(() => {
    const slot = slotRef.current;
    if (!slot) {
      return;
    }
    const measure = () => {
      const words = slot.querySelectorAll<HTMLElement>('.home-flip__word');
      setWidths(Array.from(words, (word) => word.scrollWidth));
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const timer = window.setTimeout(
      () => {
        if (index === WORDS.length - 1) {
          // On the repeated "React", once the roll to it is done: jump back to
          // the first one, unanimated.
          setAnimate(false);
          setIndex(0);
        } else {
          setAnimate(true);
          setIndex(index + 1);
        }
      },
      index === WORDS.length - 1 ? ROLL_MS + 50 : HOLD_MS,
    );
    return () => window.clearTimeout(timer);
  }, [index]);

  return (
    <>
      <span className="home-sr-only">React</span>
      <span
        ref={slotRef}
        className="home-flip"
        aria-hidden="true"
        style={{
          width: widths ? widths[index] : undefined,
          transition: animate ? undefined : 'none',
        }}
      >
        <span
          className="home-flip__track"
          style={{
            transform: `translateY(${(-index * 100) / WORDS.length}%)`,
            transition: animate ? `transform ${ROLL_MS}ms` : 'none',
          }}
        >
          {WORDS.map((word, i) => (
            <span key={i} className="home-flip__word">
              {word}
            </span>
          ))}
        </span>
      </span>
    </>
  );
}

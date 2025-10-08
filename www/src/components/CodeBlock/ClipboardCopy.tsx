'use client';
import * as React from 'react';

import { IconCopy } from '../icons/IconCopy';
import { IconCheck } from '../icons/IconCheck';

export function ClipboardCopy(props: { text: string }) {
  const timeoutIdRef = React.useRef<number | null>(null);

  const [copyTimestamp, setCopyTimestamp] = React.useState(0);

  function onClick() {
    setCopyTimestamp(Date.now());
    navigator.clipboard.writeText(props.text);
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(() => {
      setCopyTimestamp(0);
    }, 2000) as any as number;
  }
  return (
    <div
      className="cursor-pointer absolute bottom-3 right-3 inline-flex items-center gap-1 text-[10px] tracking-wide text-gray-300 group-hover:visible invisible bg-gray-800 hover:bg-gray-700 py-[2px] px-1 leading-snug rounded-md"
      onClick={onClick}
      title="Copy to clipboard"
    >
      {!copyTimestamp ? (
        <>
          <IconCopy size={10} /> COPY
        </>
      ) : (
        <>
          <IconCheck size={10} /> COPIED
        </>
      )}
    </div>
  );
}

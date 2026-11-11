import Link from 'next/link';
import * as React from 'react';

/**
 * The comparison copy is written as plain strings, with a tiny subset of
 * markdown: [label](url), `code` and **bold**. Plain strings keep the copy
 * easy to edit, and reusable outside React (FAQ structured data,
 * /compare/matrix.json).
 */
const INLINE = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|\*\*([^*]+)\*\*/g;

export function Inline({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  while ((match = INLINE.exec(text))) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const [, label, href, code, bold] = match;
    const key = match.index;
    if (label && href) {
      parts.push(
        href.startsWith('/') || href.startsWith('#') ? (
          <Link key={key} href={href}>
            {label}
          </Link>
        ) : (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        ),
      );
    } else if (code) {
      parts.push(<code key={key}>{code}</code>);
    } else if (bold) {
      parts.push(<strong key={key}>{bold}</strong>);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push(text.slice(last));
  }
  return <>{parts}</>;
}

/** the same text, without the markup - for structured data */
export function toPlainText(text: string) {
  return text.replace(INLINE, (_, label, _href, code, bold) => {
    return label ?? code ?? bold ?? '';
  });
}

export function Paragraphs({ items }: { items: string[] }) {
  return (
    <>
      {items.map((text, i) => (
        <p key={i}>
          <Inline text={text} />
        </p>
      ))}
    </>
  );
}

import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

export type IndexEntry = {
  type: 'folder' | 'page';
  name: string;
  href: string;
};

export type TestPagesIndexProps = {
  segments: string[];
  parentHref: string | null;
  entries: IndexEntry[];
};

const STORAGE_KEY = 'infinite-tests:index-search';

// Muted, low-contrast palette tuned for the dark (black) page background.
const ACCENT = '#8faecd';

const highlight = (text: string, query: string) => {
  if (!query) {
    return text;
  }
  const lower = text.toLowerCase();
  const target = query.toLowerCase();
  const idx = lower.indexOf(target);
  if (idx === -1) {
    return text;
  }
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: 'rgba(96, 140, 190, 0.35)',
          color: 'inherit',
          padding: '0 2px',
          borderRadius: 2,
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
};

export const TestPagesIndex: React.FC<TestPagesIndexProps> = ({
  segments,
  parentHref,
  entries,
}) => {
  const title = segments.length === 0 ? 'Test pages' : segments.join(' / ');

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Restore the last query (per-session). It is intentionally not part of
  // SSR output to avoid hydration mismatches; we only sync after mount.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const saved = window.sessionStorage.getItem(STORAGE_KEY) ?? '';
    if (saved) {
      setQuery(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.sessionStorage.setItem(STORAGE_KEY, query);
  }, [query]);

  // "/" focuses the search input — common convention; only when not already
  // typing into another input.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/') {
        return;
      }
      const active = document.activeElement;
      const isEditable =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable);
      if (isEditable) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return entries;
    }
    return entries.filter((entry) =>
      entry.name.toLowerCase().includes(trimmed),
    );
  }, [entries, query]);

  // The query is persisted to sessionStorage so that re-rendering the same
  // index (e.g. after a re-mount) keeps the user's typed filter. When the
  // user navigates *away* from this index — into a folder, into a page, or
  // via the Back link — we want each new index view to start unfiltered.
  const clearPersistedQuery = () => {
    if (typeof window === 'undefined') {
      return;
    }
    window.sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontFamily: 'sans-serif',
        color: 'rgba(255, 255, 255, 0.75)',
        // native widgets (search clear button, scrollbars) render dark
        colorScheme: 'dark',
      }}
    >
      {parentHref !== null && <>
        <a
          href={parentHref}
          onClick={clearPersistedQuery}
          style={{
            alignSelf: 'flex-start',
            color: ACCENT,
            textDecoration: 'none',
          }}
        >
          ← Back
        </a>
        <a
          href={'/tests'}
          onClick={clearPersistedQuery}
          style={{
            alignSelf: 'flex-start',
            color: ACCENT,
            textDecoration: 'none',
          }}
        >
          ← Tests
        </a>
        </>
      }

      <h1 style={{ margin: 0, color: 'rgba(255, 255, 255, 0.85)' }}>
        {title}
      </h1>

      {entries.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter… (press / to focus)"
            aria-label="Filter test pages in this folder"
            style={{
              flex: '1 1 240px',
              maxWidth: 360,
              padding: '6px 10px',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.18)',
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'inherit',
              font: 'inherit',
              outline: 'none',
            }}
          />
          <span style={{ opacity: 0.7, fontSize: 13 }}>
            {query.trim()
              ? `${filtered.length} / ${entries.length}`
              : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
          </span>
        </div>
      )}

      {entries.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No test pages in this folder.</p>
      ) : filtered.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No matches for “{query.trim()}”.</p>
      ) : (
        <ul
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            paddingLeft: 20,
            margin: 0,
          }}
        >
          {filtered.map((entry) => (
            <li key={`${entry.type}:${entry.href}`}>
              <a
                href={entry.href}
                onClick={clearPersistedQuery}
                style={{
                  color: ACCENT,
                  textDecoration: 'none',
                }}
              >
                {entry.type === 'folder' ? '📁 ' : ''}
                {highlight(entry.name, query.trim())}
                {entry.type === 'folder' ? '/' : ''}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

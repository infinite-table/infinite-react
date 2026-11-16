/**
 * The grid themes the site shows, in the order of the gallery. Each one is a
 * CSS file of the library (the default theme is in index.css) and a
 * className; every theme has a light and a dark mode.
 */
export type SiteTheme = {
  id: string;
  label: string;
  description: string;
  /** the docs section about it, when there's one */
  docsHash?: string;
};

export const SITE_THEMES: readonly SiteTheme[] = [
  {
    id: 'terminal',
    label: 'Terminal',
    description:
      'For dense, data-heavy screens like trading desks: a monospace font with tabular numbers, compact rows, hairline dividers and green / red flashing.',
    docsHash: 'terminal-theme',
  },
  {
    id: 'sheet',
    label: 'Sheet',
    description:
      'Looks like a spreadsheet: full gridlines, sharp corners, a thick active cell border with a fill handle, spreadsheet-style headers.',
    docsHash: 'sheet-theme',
  },
  {
    id: 'paper',
    label: 'Paper',
    description:
      'Borderless and airy: hairline row separators, a subtle hover, selected rows as rounded pills, and its own rounded icons.',
    docsHash: 'paper-theme',
  },
  {
    id: 'default',
    label: 'Default',
    description:
      'The theme in index.css, used when you pick none: neutral greys, cell borders and a blue accent.',
    docsHash: 'default-theme',
  },
  {
    id: 'minimalist',
    label: 'Minimalist',
    description:
      'Keeps the UI simple and clean: no header borders and only light separators between rows.',
    docsHash: 'minimalist-theme',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    description:
      'Blues all the way: a sky-blue header on a pale blue body in light mode, deep navy in dark, with a violet accent.',
  },
  {
    id: 'balsam',
    label: 'Balsam',
    description:
      'Quiet greys and soft borders, on white in light mode and on charcoal in dark.',
  },
];

export function themeCssImports(id: string) {
  const root = `import '@infinite-table/infinite-react/index.css';`;
  return id === 'default'
    ? root
    : `${root}\nimport '@infinite-table/infinite-react/theme/${id}.css';`;
}

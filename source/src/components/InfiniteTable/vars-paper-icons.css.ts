import { svgToCSSUrl } from './components/icons/iconDataUri';
import { ThemeVars } from './vars.css';

// the icon set of the paper theme: rounded strokes, drawn on a 24x24 grid
const stroke = (content: string) =>
  svgToCSSUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'>${content}</svg>`,
  );
const path = (d: string) => `<path d='${d}'/>`;
const dot = (cx: number, cy: number) =>
  `<circle cx='${cx}' cy='${cy}' r='1.4' fill='black' stroke='none'/>`;

export const PaperIcons = {
  [ThemeVars.icons.expandCollapse]: stroke(path('M9.5 6.5l5.5 5.5-5.5 5.5')),
  [ThemeVars.icons.loading]: stroke(path('M12 3.5a8.5 8.5 0 1 0 8.5 8.5')),
  [ThemeVars.icons.sortAsc]: stroke(path('M12 18.5v-13M6.5 11l5.5-5.5 5.5 5.5')),
  [ThemeVars.icons.sortDesc]: stroke(path('M12 5.5v13M6.5 13l5.5 5.5 5.5-5.5')),
  [ThemeVars.icons.filter]: stroke(path('M4.5 6h15l-5.75 6.5v5l-3.5 1.75v-6.75z')),
  [ThemeVars.icons.menu]: stroke(dot(6, 12) + dot(12, 12) + dot(18, 12)),
  [ThemeVars.icons.done]: stroke(path('M5.5 12.5l4 4 9-9')),
  [ThemeVars.icons.clear]: stroke(path('M7 7l10 10M17 7L7 17')),
  [ThemeVars.icons.hidden]: stroke(
    path('M4 4l16 16') +
      path('M10.5 6.2c.5-.1 1-.2 1.5-.2 4.6 0 7.8 4 8.8 6-.4.8-1.1 1.9-2.1 2.9') +
      path('M7 7.6C5.2 8.8 3.9 10.6 3.2 12c1 2 4.2 6 8.8 6 1.4 0 2.7-.4 3.8-1') +
      path('M9.9 9.9a3 3 0 0 0 4.2 4.2'),
  ),
  [ThemeVars.icons.filterOperatorContains]: stroke(
    `<circle cx='10.5' cy='10.5' r='5.5'/>` + path('M14.5 14.5l4.5 4.5'),
  ),
  [ThemeVars.icons.filterOperatorStartsWith]: stroke(
    path('M5.5 5v14M9.5 9h9M9.5 15h6'),
  ),
  [ThemeVars.icons.filterOperatorEndsWith]: stroke(
    path('M18.5 5v14M5.5 9h9M8.5 15h6'),
  ),
  [ThemeVars.icons.filterOperatorEq]: stroke(path('M6 9.5h12M6 14.5h12')),
  [ThemeVars.icons.filterOperatorNeq]: stroke(
    path('M6 9.5h12M6 14.5h12M15 5.5l-6 13'),
  ),
  [ThemeVars.icons.filterOperatorGt]: stroke(path('M8.5 6.5l7 5.5-7 5.5')),
  [ThemeVars.icons.filterOperatorGte]: stroke(
    path('M8.5 4.5l7 5-7 5M8.5 19h7'),
  ),
  [ThemeVars.icons.filterOperatorLt]: stroke(path('M15.5 6.5l-7 5.5 7 5.5')),
  [ThemeVars.icons.filterOperatorLte]: stroke(
    path('M15.5 4.5l-7 5 7 5M8.5 19h7'),
  ),
};

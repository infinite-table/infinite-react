import Link from 'next/link';

import { CodeBlock } from '@www/components/CodeBlock';
import { ThemeGallery } from '@www/components/themes/ThemeGallery';
import { SITE_THEMES } from '@www/components/themes/registry';
import { asMeta } from '@www/utils/asMeta';

import '@www/components/home/home.css';
import '@www/components/themes/themes.css';

export const metadata = asMeta({
  title: 'Themes | Infinite Table DataGrid for React, Vue and Angular',
  description: `The ${SITE_THEMES.length} themes of Infinite Table, live: each in light and dark mode, at three densities, with the CSS to use it.`,
}, 'themes');

const OVERRIDE_CODE = `.my-grid {
  --infinite-accent-color: #1d5cff;
  --infinite-background: #fcfcfd;
  --infinite-header-background: #f3f5f8;
  --infinite-row-height: 32px;
  --infinite-font-family: 'IBM Plex Sans', sans-serif;
}`;

export default function ThemesPage() {
  return (
    <div className="home themes-page">
      <section className="home-hero themes-hero">
        <div className="home-wrap">
          <p className="home-tagline">Themes</p>
          <h1>{SITE_THEMES.length} themes. Light and dark. Three densities.</h1>
          <p className="home-hero__sub">
            Every theme is one CSS file and a className, in a light and a dark
            mode, and the density classNames scale any of them. The grids below
            are live: scroll, sort, select.
          </p>
        </div>
      </section>

      <section className="themes-section">
        <div className="home-wrap">
          <ThemeGallery />
        </div>
      </section>

      <section className="home-sec themes-vars">
        <div className="home-sec__bar">
          <div className="home-wrap home-sec__bar-in">
            <span className="home-sec__no">
              <b>CSS</b> / Make it yours
            </span>
            <span className="home-sec__no">
              <Link href="/docs/learn/theming/css-variables">
                All CSS variables →
              </Link>
            </span>
          </div>
        </div>
        <div className="home-wrap">
          <div className="home-sec__head">
            <h2>Every value is a CSS variable.</h2>
            <p>
              Start from any theme and override what you need: colors, row
              height, paddings, fonts, borders and icons. Scope the variables to
              a className to theme one grid, or set them on <code>:root</code>{' '}
              for all of them.
            </p>
          </div>
          <div className="home-split">
            <div className="home-split__code">
              <CodeBlock lang="css" title="styles.css">
                {OVERRIDE_CODE}
              </CodeBlock>
            </div>
            <div className="themes-links">
              <Link href="/docs/learn/theming">
                <b>Theming</b>
                <span>
                  Applying a theme, light and dark mode, density, icons
                </span>
              </Link>
              <Link href="/docs/learn/theming/css-variables">
                <b>CSS variables</b>
                <span>The full list, with what each one changes</span>
              </Link>
              <Link href="/docs/learn/theming#icons">
                <b>Icons</b>
                <span>Replace any icon with a CSS variable</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

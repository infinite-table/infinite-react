import type { HeroColorMode } from './themes';

const ALT =
  'Infinite Table live trading blotter: ticking prices, sparklines, sector P&L and a market heatmap';

/**
 * First paint: a screenshot of the live hero (no JS needed), replaced by the
 * real thing once it has loaded. Regenerate the images when the hero's look
 * changes (they live in /public/hero).
 *
 * Without a `mode`, the poster follows the site's light / dark mode
 * (<html data-theme>) in CSS (hero-frame.css): a background image per mode,
 * so only the one shown is downloaded and the first paint already has the
 * right one.
 */
export function HeroPoster({ mode }: { mode?: HeroColorMode }) {
  if (!mode) {
    return <div className="hero-poster hero-poster--site" role="img" aria-label={ALT} />;
  }
  const light = mode === 'light';
  return (
    <div className="hero-poster">
      <picture>
        {light ? null : (
          <source
            media="(max-width: 639px)"
            srcSet="/hero/hero-poster-dark-mobile.webp"
          />
        )}
        <img
          src={
            light
              ? '/hero/hero-poster-light.webp'
              : '/hero/hero-poster-dark.webp'
          }
          alt={ALT}
          width={1704}
          height={1080}
          decoding="async"
          fetchPriority="high"
        />
      </picture>
    </div>
  );
}

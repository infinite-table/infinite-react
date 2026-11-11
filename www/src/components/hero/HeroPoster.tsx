import type { HeroColorMode } from './themes';

/**
 * First paint: a screenshot of the live hero (no JS needed), replaced by the
 * real thing once it has loaded. Regenerate the images when the hero's look
 * changes (they live in /public/hero).
 */
export function HeroPoster({ mode = 'dark' }: { mode?: HeroColorMode }) {
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
          alt="Infinite Table live trading blotter: ticking prices, sparklines, sector P&L and a market heatmap"
          width={1704}
          height={1080}
          decoding="async"
          fetchPriority="high"
        />
      </picture>
    </div>
  );
}

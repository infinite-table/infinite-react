/**
 * Helpers for building the CSS images used by the themeable icons.
 *
 * The icons are painted with a background color (currentColor by default),
 * masked by the image - so only the alpha channel of the image matters
 * (any opaque fill works, we use the default black).
 */

/**
 * Turns SVG markup into a CSS `url("data:image/svg+xml,...")` value.
 */
export function svgToCSSUrl(svg: string): string {
  const encoded = svg
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/"/g, "'")
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E');

  return `url("data:image/svg+xml,${encoded}")`;
}

/**
 * Turns a list of SVG path `d` values into a CSS `url()` image.
 */
export function svgPathsToCSSUrl(
  paths: readonly string[],
  viewBox: string = '0 0 24 24',
): string {
  return svgToCSSUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${viewBox}'>${paths
      .map((d) => `<path d='${d}'/>`)
      .join('')}</svg>`,
  );
}

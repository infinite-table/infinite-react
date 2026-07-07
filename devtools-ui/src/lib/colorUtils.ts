/**
 * Converts a CSS color value to a #rrggbb hex string usable by <input type="color">.
 * Handles hex (#rgb, #rrggbb, #rrggbbaa) and rgb()/rgba() - which covers all
 * computed color values. Returns null when the value cannot be converted.
 */
export function cssColorToHex(value: string): string | null {
  const v = (value || '').trim();

  if (!v) {
    return null;
  }

  const hexMatch = v.match(/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .slice(0, 3)
        .split('')
        .map((c) => c + c)
        .join('');
    }
    return `#${hex.slice(0, 6).toLowerCase()}`;
  }

  const rgbMatch = v.match(
    /^rgba?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*[,\s]\s*([\d.]+)/i,
  );
  if (rgbMatch) {
    const toHex = (n: string) => {
      const num = Math.max(0, Math.min(255, Math.round(parseFloat(n))));
      return num.toString(16).padStart(2, '0');
    };
    return `#${toHex(rgbMatch[1])}${toHex(rgbMatch[2])}${toHex(rgbMatch[3])}`;
  }

  // named colors, hsl(), etc - let the browser normalize via canvas
  return normalizeViaCanvas(v);
}

let canvasContext: CanvasRenderingContext2D | null | undefined;

function normalizeViaCanvas(value: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  if (canvasContext === undefined) {
    canvasContext = document.createElement('canvas').getContext('2d');
  }
  if (!canvasContext) {
    return null;
  }

  // an invalid color leaves fillStyle unchanged, so reset to a sentinel first
  canvasContext.fillStyle = '#010203';
  canvasContext.fillStyle = value;
  const normalized = canvasContext.fillStyle;

  if (normalized === '#010203') {
    // value is invalid (or happens to be the sentinel color, which is fine to skip)
    return null;
  }

  if (normalized.startsWith('#')) {
    return normalized.slice(0, 7).toLowerCase();
  }
  const rgbMatch = normalized.match(
    /^rgba?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*[,\s]\s*([\d.]+)/i,
  );
  if (rgbMatch) {
    const toHex = (n: string) => {
      const num = Math.max(0, Math.min(255, Math.round(parseFloat(n))));
      return num.toString(16).padStart(2, '0');
    };
    return `#${toHex(rgbMatch[1])}${toHex(rgbMatch[2])}${toHex(rgbMatch[3])}`;
  }
  return null;
}

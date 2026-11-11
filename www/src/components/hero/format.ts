const price2 = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const int = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const signedInt = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
  signDisplay: 'exceptZero',
});
const signedCompact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});

export const formatPrice = (value: number) => price2.format(value);
export const formatInt = (value: number) => int.format(value);
export const formatCompact = (value: number) => compact.format(value);
export const formatSigned = (value: number) => signedInt.format(value);
export const formatSignedCompact = (value: number) =>
  signedCompact.format(value);

export function formatPct(value: number) {
  const abs = Math.abs(value);
  return `${value > 0 ? '+' : value < 0 ? '−' : ''}${abs.toFixed(2)}%`;
}

/** P&L in dollars: $12.4K / −$1.2M. */
export function formatMoney(value: number) {
  const sign = value < 0 ? '−' : value > 0 ? '+' : '';
  return `${sign}$${compact.format(Math.abs(value))}`;
}

/** Market cap from $ millions: $820M / $34.5B / $1.2T. */
export function formatCap(millions: number) {
  if (millions >= 1_000_000) return `$${(millions / 1_000_000).toFixed(2)}T`;
  if (millions >= 1_000) return `$${(millions / 1_000).toFixed(1)}B`;
  return `$${Math.round(millions)}M`;
}

export const tone = (value: number) =>
  value > 0 ? 'up' : value < 0 ? 'down' : 'flat';

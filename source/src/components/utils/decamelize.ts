export function decamelize(str: string, options?: { separator: string }) {
  const { separator } = options ?? { separator: '-' };

  return str
    .replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
    .replace(
      new RegExp('(' + separator + '[A-Z])([A-Z])', 'g'),
      '$1' + separator + '$2',
    )
    .toLowerCase();
}

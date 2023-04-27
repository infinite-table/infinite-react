export function toHashUrl(str: string) {
  return str
    .toLowerCase()
    .replaceAll('.', '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]+/g, '');
}

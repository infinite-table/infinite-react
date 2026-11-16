export function isTargetInput(target: EventTarget | HTMLElement | null) {
  if (!target) {
    return false;
  }
  const tagName = (target as HTMLElement).tagName;
  return tagName === 'INPUT' || tagName === 'BUTTON';
}

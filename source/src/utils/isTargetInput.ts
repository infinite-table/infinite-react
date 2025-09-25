export function isTargetInput(target: EventTarget | HTMLElement) {
  if (!target) {
    return false;
  }
  const tagName = (target as HTMLElement).tagName;
  return tagName === 'INPUT' || tagName === 'BUTTON';
}

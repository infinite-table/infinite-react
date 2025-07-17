export function selectParent(el: HTMLElement, selector: string) {
  let node: HTMLElement | null = el;

  if (!node) {
    return null;
  }

  if (node && node.matches(selector)) {
    return node;
  }
  while ((node = node.parentElement)) {
    if (node.matches(selector)) {
      return node;
    }
  }

  return null;
}

export function selectParentUntil(
  el: HTMLElement,
  selector: string,
  root: HTMLElement | null,
) {
  let node: HTMLElement | null = el;

  if (!node) {
    return null;
  }

  if (node && node.matches(selector)) {
    return node;
  }
  while ((node = node.parentElement)) {
    if (node.matches(selector)) {
      return node;
    }
    if (node === root) {
      return null;
    }
  }

  return null;
}

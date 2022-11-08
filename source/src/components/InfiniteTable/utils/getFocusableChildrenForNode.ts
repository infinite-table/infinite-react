const selector = [
  'input',
  'textarea',
  'select',
  '[tabindex]',
  'a[href]',
  'button',
  'object',
].join(', ');

export const getFocusableChildrenForNode = (node: HTMLElement) => {
  const children = Array.from(node.querySelectorAll(selector));

  // ensure they are all in the dom
  return children.filter(
    (child) => !!(child as HTMLDivElement).offsetParent,
  ) as HTMLElement[];
};

export const getFirstFocusableChildForNode = (node: HTMLElement) => {
  return node.querySelector(selector) as HTMLElement | null;
};

import { selectParent } from '../../../utils/selectParent';
import { stripVar } from '../../../utils/stripVar';
import { internalProps } from '../internalProps';
import { InternalVars } from '../theme.css';

const InfiniteSelector = `.${internalProps.rootClassName}`;
export function getParentInfiniteNode(node: HTMLElement) {
  return selectParent(node, InfiniteSelector);
}

export function setInfiniteVar(
  varName: keyof typeof InternalVars,
  varValue: string | number,
  node: HTMLElement | null,
) {
  const infinite = node
    ? getParentInfiniteNode(node)
    : (document.querySelector(InfiniteSelector) as HTMLElement);

  if (infinite) {
    infinite.style.setProperty(stripVar(InternalVars[varName]), `${varValue}`);
  }
}

export function setInfiniteVars(
  vars: Partial<Record<keyof typeof InternalVars, string | number>>,
  node: HTMLElement | null,
) {
  const infinite = node
    ? getParentInfiniteNode(node)
    : (document.querySelector(InfiniteSelector) as HTMLElement);

  if (infinite) {
    for (var varName in vars) {
      infinite.style.setProperty(
        stripVar(InternalVars[varName as keyof typeof InternalVars]),
        `${vars[varName as keyof typeof InternalVars]}`,
      );
    }
  }
}

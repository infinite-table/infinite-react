import { stripVar } from './stripVar';
import { ThemeVars } from '../components/InfiniteTable/vars.css';

/**
 * Flattens the ThemeVars contract to the list of public `--infinite-*` CSS variable names.
 * Excludes runtime vars (internal layout values) and vars not meant to be overriden.
 */
export function collectThemeVarNames(): string[] {
  const names: string[] = [];

  const traverse = (obj: Record<string, any>) => {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (typeof value === 'string') {
        const varName = stripVar(value);
        if (varName.includes('dont-override')) {
          return;
        }
        names.push(varName);
      } else if (value && typeof value === 'object') {
        traverse(value);
      }
    });
  };

  traverse({
    ...ThemeVars,
    loaded: undefined,
    runtime: undefined,
  } as Record<string, any>);

  return names;
}

export function readThemeVars(
  domNode: HTMLElement | null,
): Record<string, string> {
  if (!domNode) {
    return {};
  }
  const themeVarNames = collectThemeVarNames();
  const computedStyle = getComputedStyle(domNode);
  const result: Record<string, string> = {};
  themeVarNames.forEach((name) => {
    result[name] = computedStyle.getPropertyValue(name).trim();
  });
  return result;
}

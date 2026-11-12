import { DarkVars } from './vars-default-dark.css';
import { LightVars } from './vars-default-light.css';

const DefaultVarsByMode: Record<'light' | 'dark', Record<string, unknown>> = {
  light: LightVars,
  dark: { ...LightVars, ...DarkVars },
};

/**
 * The value a variable has in the default theme, in the given mode, with the
 * variables it references replaced by their own values.
 *
 * For a theme that spreads `DerivedVars` but has to keep one of them as the
 * default theme has it. Example: a theme without cell borders sets the cell
 * border width to 0, and that would also remove the pinned column border and
 * the border of the filter editors, which are made from the cell border.
 */
export function getDefaultThemeValue(
  cssVar: string,
  mode: 'light' | 'dark',
): string {
  const vars = DefaultVarsByMode[mode];
  const resolve = (name: string): string =>
    `${vars[name]}`.replace(/var\(--[\w-]+\)/g, (reference) =>
      reference in vars ? resolve(reference) : reference,
    );

  return resolve(cssVar);
}

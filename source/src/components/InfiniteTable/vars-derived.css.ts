import { LightVars } from './vars-default-light.css';

/**
 * The variables of the default theme whose values reference other variables
 * (eg: `--infinite-focus-outline: 2px solid var(--infinite-accent-color)`).
 *
 * A custom property that references another one is resolved on the element
 * where it's declared - the default theme declares these on :root, so a
 * theme that changes the accent color (or the background, etc) on its own
 * element has to declare them again there, for them to use its values.
 * Themes spread these first, and then their own values.
 */
export const DerivedVars = Object.fromEntries(
  Object.entries(LightVars).filter(
    ([, value]) => typeof value === 'string' && value.includes('var('),
  ),
) as Record<string, string>;

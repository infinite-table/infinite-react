import {
  fallbackVar,
  keyframes,
  style,
  styleVariants,
} from '@vanilla-extract/css';

import { ThemeVars } from '../../vars.css';
import { CUSTOMIZABLE_ICONS, CustomizableIconName } from './customizableIcons';
import { maskLayout } from './iconStyles';

/**
 * How path icons are made themeable, at no cost for the default icons:
 *
 * the icon is still the inline `<svg><path /></svg>` it always was. The svg
 * also has a background (a gradient in the icon color) whose size comes from
 * the `--infinite-icon-<name>` variable, and a mask image from the same
 * variable:
 *
 * - when the variable is NOT specified: `background-size: 0 0` (nothing is
 *   painted) and `mask-image: none` - so the default icon is painted exactly
 *   as before, with no mask.
 * - when it IS specified (eg: `url("data:image/svg+xml,...")`): substituting
 *   a url() into `background-size` makes the declaration invalid at
 *   computed-value time, so it computes to its initial value (`auto`) and the
 *   background fills the svg. The svg is masked by the image - so what shows
 *   is the custom icon shape, in the icon color.
 *
 * The mask costs more to paint than the inline path (measured: with ~800
 * icons on screen, frames are a few times slower), which is why the default
 * icons are not masks. The two var() references per icon have a small style
 * recalc cost (a few % of the icons' style recalc time in Chromium).
 */
const iconNames = Object.fromEntries(
  Object.keys(CUSTOMIZABLE_ICONS).map((name) => [name, name]),
) as Record<CustomizableIconName, CustomizableIconName>;

const iconColors: Partial<Record<CustomizableIconName, string>> = {
  expandCollapse: ThemeVars.components.ExpandCollapseIcon.color,
  loading: ThemeVars.color.accent,
};

export const IconCustomMaskCls = styleVariants(iconNames, (name) => {
  const iconVar = ThemeVars.icons[name];
  const color = iconColors[name] ?? 'currentColor';
  const image = fallbackVar(iconVar, 'none');
  return {
    ...maskLayout,
    WebkitMaskImage: image,
    backgroundImage: `linear-gradient(${color}, ${color})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: fallbackVar(iconVar, '0 0'),
  };
});

const rotate = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

/**
 * The default loading icon rotates its circle (svg animateTransform) - a
 * custom loading icon can't be rotated that way, so the svg element itself
 * is rotated, but only when the custom icon is specified: `running` is the
 * initial value of animation-play-state, which the declaration computes to
 * when the variable holds a url().
 */
export const LoadingIconSpinWhenCustomCls = style({
  animation: `${rotate} 1s linear infinite`,
  animationPlayState: fallbackVar(ThemeVars.icons.loading, 'paused'),
});

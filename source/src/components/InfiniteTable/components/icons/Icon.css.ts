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
 * the icon is still the inline `<svg><path /></svg>` it always was, plus a
 * `<rect>` covering the whole viewBox (the "custom layer").
 *
 * - when `--infinite-icon-<name>` is NOT specified: the svg has
 *   `mask-image: none` and the rect has `display: none` - so the default
 *   icon is painted exactly as before, with no mask.
 * - when it IS specified (eg: `url("data:image/svg+xml,...")`): the svg is
 *   masked by that image, and the rect is displayed - substituting a url()
 *   into `display` makes the declaration invalid at computed-value time, so
 *   it computes to its initial value (`inline`). The rect is painted with
 *   the same fill as the path, so what shows is the custom icon shape, in the
 *   icon color.
 *
 * The mask costs more to paint than the inline path (measured: with ~800
 * icons on screen, frames are a few times slower), which is why the default
 * icons are not masks.
 */
const iconNames = Object.fromEntries(
  Object.keys(CUSTOMIZABLE_ICONS).map((name) => [name, name]),
) as Record<CustomizableIconName, CustomizableIconName>;

export const IconCustomMaskCls = styleVariants(iconNames, (name) => {
  const image = fallbackVar(ThemeVars.icons[name], 'none');
  return {
    ...maskLayout,
    WebkitMaskImage: image,
    maskImage: image,
  };
});

export const IconCustomLayerCls = styleVariants(iconNames, (name) => ({
  display: fallbackVar(ThemeVars.icons[name], 'none'),
}));

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

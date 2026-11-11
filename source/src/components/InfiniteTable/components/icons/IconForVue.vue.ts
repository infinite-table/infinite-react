import { defineComponent, h } from 'vue';
import type { CSSProperties, FunctionalComponent, PropType } from 'vue';

import { join } from '../../../../utils/join';
import { IconCustomMaskCls } from './Icon.css';
import { CUSTOMIZABLE_ICONS, CustomizableIconName } from './customizableIcons';
import { iconPaths } from './iconPaths';
import { InfiniteIconClassName } from './InfiniteIconClassName';

/**
 * Vue sibling of the React Icon svg wrapper (Icon.tsx) plus factory-generated
 * operator/done/clear icons from the shared iconPaths data.
 */
export const Icon = defineComponent({
  name: 'InfiniteIcon',
  props: {
    size: { type: Number, default: undefined },
    style: { type: Object as PropType<CSSProperties>, default: undefined },
    className: { type: String, default: undefined },
    viewBox: { type: String, default: '0 0 24 24' },
    paths: {
      type: Array as PropType<readonly string[]>,
      required: true,
    },
    /**
     * When specified, the icon can be replaced via the corresponding
     * `--infinite-icon-*` CSS variable - see Icon.css.ts
     */
    icon: {
      type: String as PropType<CustomizableIconName>,
      default: undefined,
    },
  },
  setup(props) {
    return () => {
      const size = props.size ?? `var(--infinite-icon-size)`;
      const style: CSSProperties = {
        flex: 'none',
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        fill: 'currentColor',
        ...props.style,
      };
      const icon = props.icon;
      return h(
        'svg',
        {
          viewBox: props.viewBox,
          class: icon
            ? join(
                props.className,
                IconCustomMaskCls[icon],
                InfiniteIconClassName,
                `${InfiniteIconClassName}-${CUSTOMIZABLE_ICONS[icon]}`,
              )
            : props.className,
          style,
        },
        props.paths.map((d) => h('path', { d })),
      );
    };
  },
});

type IconProps = {
  size?: number;
  style?: CSSProperties;
  className?: string;
};

function iconFromPaths(
  name: string,
  paths: readonly string[],
  icon: CustomizableIconName,
): FunctionalComponent<IconProps> {
  const cmp: FunctionalComponent<IconProps> = (props) =>
    h(Icon, { ...props, paths, icon });
  cmp.displayName = name;
  return cmp;
}

export const IncludesOperatorIcon = iconFromPaths(
  'IncludesOperatorIcon',
  iconPaths.includesOperator,
  'filterOperatorContains',
);
export const StartsWithOperatorIcon = iconFromPaths(
  'StartsWithOperatorIcon',
  iconPaths.startsWithOperator,
  'filterOperatorStartsWith',
);
export const EndsWithOperatorIcon = iconFromPaths(
  'EndsWithOperatorIcon',
  iconPaths.endsWithOperator,
  'filterOperatorEndsWith',
);
export const EqualOperatorIcon = iconFromPaths(
  'EqualOperatorIcon',
  iconPaths.eqOperator,
  'filterOperatorEq',
);
export const NotEqualOperatorIcon = iconFromPaths(
  'NotEqualOperatorIcon',
  iconPaths.neqOperator,
  'filterOperatorNeq',
);
export const GTOperatorIcon = iconFromPaths(
  'GTOperatorIcon',
  iconPaths.gtOperator,
  'filterOperatorGt',
);
export const GTEOperatorIcon = iconFromPaths(
  'GTEOperatorIcon',
  iconPaths.gteOperator,
  'filterOperatorGte',
);
export const LTOperatorIcon = iconFromPaths(
  'LTOperatorIcon',
  iconPaths.ltOperator,
  'filterOperatorLt',
);
export const LTEOperatorIcon = iconFromPaths(
  'LTEOperatorIcon',
  iconPaths.lteOperator,
  'filterOperatorLte',
);
export const DoneIcon = iconFromPaths('DoneIcon', iconPaths.done, 'done');
export const ClearIcon = iconFromPaths('ClearIcon', iconPaths.clear, 'clear');

export const HiddenIcon: FunctionalComponent<IconProps> = (props) =>
  h(Icon, {
    ...props,
    viewBox: '0 -960 960 960',
    paths: iconPaths.hidden,
    icon: 'hidden',
  });
HiddenIcon.displayName = 'HiddenIcon';

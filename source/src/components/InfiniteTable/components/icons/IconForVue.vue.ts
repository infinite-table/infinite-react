import { defineComponent, h } from 'vue';
import type { CSSProperties, FunctionalComponent, PropType } from 'vue';

import { iconPaths } from './iconPaths';

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
      return h(
        'svg',
        { viewBox: props.viewBox, class: props.className, style },
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
): FunctionalComponent<IconProps> {
  const cmp: FunctionalComponent<IconProps> = (props) =>
    h(Icon, { ...props, paths });
  cmp.displayName = name;
  return cmp;
}

export const IncludesOperatorIcon = iconFromPaths(
  'IncludesOperatorIcon',
  iconPaths.includesOperator,
);
export const StartsWithOperatorIcon = iconFromPaths(
  'StartsWithOperatorIcon',
  iconPaths.startsWithOperator,
);
export const EndsWithOperatorIcon = iconFromPaths(
  'EndsWithOperatorIcon',
  iconPaths.endsWithOperator,
);
export const EqualOperatorIcon = iconFromPaths(
  'EqualOperatorIcon',
  iconPaths.eqOperator,
);
export const NotEqualOperatorIcon = iconFromPaths(
  'NotEqualOperatorIcon',
  iconPaths.neqOperator,
);
export const GTOperatorIcon = iconFromPaths(
  'GTOperatorIcon',
  iconPaths.gtOperator,
);
export const GTEOperatorIcon = iconFromPaths(
  'GTEOperatorIcon',
  iconPaths.gteOperator,
);
export const LTOperatorIcon = iconFromPaths(
  'LTOperatorIcon',
  iconPaths.ltOperator,
);
export const LTEOperatorIcon = iconFromPaths(
  'LTEOperatorIcon',
  iconPaths.lteOperator,
);
export const DoneIcon = iconFromPaths('DoneIcon', iconPaths.done);
export const ClearIcon = iconFromPaths('ClearIcon', iconPaths.clear);

export const HiddenIcon: FunctionalComponent<IconProps> = (props) =>
  h(Icon, { ...props, viewBox: '0 -960 960 960', paths: iconPaths.hidden });
HiddenIcon.displayName = 'HiddenIcon';

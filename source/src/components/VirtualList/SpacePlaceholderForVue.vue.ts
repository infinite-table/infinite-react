import { defineComponent, h } from 'vue';

/**
 * Vue sibling of SpacePlaceholder: an invisible element sized to the total
 * virtualized content, so the scroll container gets real scrollbars.
 */
export const SpacePlaceholder = defineComponent({
  name: 'SpacePlaceholder',
  props: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    count: { type: Number, required: false },
  },
  setup(props) {
    return () =>
      h('div', {
        'data-count': props.count,
        'data-placeholder-width': __DEV__ ? props.width : undefined,
        'data-placeholder-height': __DEV__ ? props.height : undefined,
        'data-name': 'SpacePlaceholder',
        style: {
          height: `${props.height}px`,
          width: `${props.width}px`,
          zIndex: -1,
          opacity: 0,
          pointerEvents: 'none',
          contain: 'strict',
        },
      });
  },
});

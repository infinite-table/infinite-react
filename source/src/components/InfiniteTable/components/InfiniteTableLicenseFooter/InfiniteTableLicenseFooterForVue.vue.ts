/**
 * Vue sibling of InfiniteTableLicenseFooter.
 */
import { defineComponent, h, onBeforeUnmount, watch } from 'vue';

import { join } from '../../../../utils/join';
import { FooterCls } from '../../InfiniteCls.css';
import { rootClassName } from '../../internalProps';
import {
  enforceLicenseFooterStyle,
  getLicenseFooterStyles,
  LICENSE_FOOTER_INVALID_MESSAGE,
  LICENSE_FOOTER_LINK,
} from './licenseFooterShared';

export const InfiniteTableLicenseFooter = defineComponent({
  name: 'InfiniteTableLicenseFooter',
  props: {
    // true when a license key was given, but it is not valid
    invalid: { type: Boolean, default: false },
  },
  setup(props) {
    let domNode: HTMLElement | null = null;
    let stopEnforcing: (() => void) | undefined;

    watch(
      () => props.invalid,
      (invalid) => {
        stopEnforcing?.();
        stopEnforcing = enforceLicenseFooterStyle(() => domNode, invalid);
      },
      { immediate: true },
    );

    onBeforeUnmount(() => {
      stopEnforcing?.();
    });

    return () => {
      const styles = getLicenseFooterStyles(props.invalid);

      return h(
        'div',
        {
          ref: (el: any) => {
            domNode = (el as HTMLElement) ?? null;
          },
          class: join(
            `${rootClassName}-Footer`,
            props.invalid ? `${rootClassName}-Footer--invalid` : null,
            FooterCls,
          ),
          style: styles.footer,
        },
        [
          props.invalid ? `${LICENSE_FOOTER_INVALID_MESSAGE} ` : null,
          'Powered by ',
          h(
            'a',
            {
              href: LICENSE_FOOTER_LINK,
              rel: 'noopener noreferrer',
              role: 'link',
              target: '_blank',
              style: styles.anchor,
            },
            'Infinite Table',
          ),
        ],
      );
    };
  },
});

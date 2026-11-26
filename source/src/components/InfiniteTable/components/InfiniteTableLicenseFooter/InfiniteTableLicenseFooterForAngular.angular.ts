/**
 * Angular sibling of InfiniteTableLicenseFooter.
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';

import { join } from '../../../../utils/join';
import { FooterCls } from '../../InfiniteCls.css';
import { rootClassName } from '../../internalProps';
import {
  enforceLicenseFooterStyle,
  getLicenseFooterStyles,
  LICENSE_FOOTER_INVALID_MESSAGE,
  LICENSE_FOOTER_LINK,
} from './licenseFooterShared';

const FOOTER_CLS = {
  missing: join(`${rootClassName}-Footer`, FooterCls),
  invalid: join(
    `${rootClassName}-Footer`,
    `${rootClassName}-Footer--invalid`,
    FooterCls,
  ),
};

/**
 * The "Powered by Infinite Table" footer the grid shows without a valid
 * license. The host is the footer div (same class names, styles and content
 * as React and Vue).
 */
@Component({
  selector: 'div[infiniteLicenseFooter]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'invalid() ? footerCls.invalid : footerCls.missing',
    '[style]': 'styles().footer',
  },
  template: `{{ prefix() }}Powered by
    <a
      [href]="link"
      rel="noopener noreferrer"
      role="link"
      target="_blank"
      [style]="styles().anchor"
      >Infinite Table</a
    >`,
})
export class InfiniteTableLicenseFooter {
  /** true when a license key was given, but it is not valid */
  readonly invalid = input(false);

  protected readonly footerCls = FOOTER_CLS;
  protected readonly link = LICENSE_FOOTER_LINK;
  protected readonly prefix = computed(() =>
    this.invalid() ? `${LICENSE_FOOTER_INVALID_MESSAGE} ` : '',
  );
  protected readonly styles = computed(() =>
    getLicenseFooterStyles(this.invalid()),
  );

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let stopEnforcing: VoidFunction | undefined;

    effect(() => {
      const invalid = this.invalid();
      untracked(() => {
        stopEnforcing?.();
        stopEnforcing = enforceLicenseFooterStyle(() => host, invalid);
      });
    });

    inject(DestroyRef).onDestroy(() => {
      stopEnforcing?.();
    });
  }
}

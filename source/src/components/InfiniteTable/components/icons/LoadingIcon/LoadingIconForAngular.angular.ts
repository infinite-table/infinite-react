import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';

import { join } from '../../../../../utils/join';
import { styleWithUnits } from '../../../../../utils/styleWithUnits';
import { IconCustomMaskCls, LoadingIconSpinWhenCustomCls } from '../Icon.css';
import { LoadingIconCls } from './loading.css';
import { loadingIconStrokeDasharray, loadingIconSvgStyle } from './shared';
import type { CSSProperties } from '../../../../types/FrameworkTypes';

/**
 * Angular sibling of LoadingIcon - the host IS the svg spinner, same class
 * names as React and Vue.
 */
@Component({
  selector: 'svg[infiniteLoadingIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '24px',
    height: '24px',
    preserveAspectRatio: 'xMidYMid',
    '[attr.viewBox]': "viewBox() ?? '0 0 100 100'",
    '[style]': 'svgStyle()',
    '[class]': 'classNameValue()',
  },
  template: `<svg:circle cx="50" cy="50" fill="none" stroke-width="10" r="35" [attr.stroke-dasharray]="dasharray"><svg:animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1" /></svg:circle>`,
})
export class LoadingIcon {
  readonly className = input<string>();
  readonly style = input<CSSProperties>();
  readonly viewBox = input<string>();

  protected readonly dasharray = loadingIconStrokeDasharray;

  protected readonly svgStyle = computed(() =>
    styleWithUnits({
      ...(loadingIconSvgStyle as Record<string, any>),
      ...(this.style() as Record<string, any>),
    }),
  );

  protected readonly classNameValue = computed(() =>
    join(
      this.className(),
      LoadingIconCls,
      IconCustomMaskCls.loading,
      LoadingIconSpinWhenCustomCls,
      'InfiniteIcon',
      'InfiniteIcon-loading',
    ),
  );
}

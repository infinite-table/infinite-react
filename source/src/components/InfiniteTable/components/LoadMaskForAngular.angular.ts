import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';

import { InfiniteRender } from '../../RawList/InfiniteRenderForAngular.angular';
import type { Renderable } from '../../types/FrameworkTypes.angular';
import { internalProps } from '../internalProps';
import {
  LoadMaskCls,
  LoadMaskOverlayCls,
  LoadMaskTextCls,
} from './LoadMask.css';

const { rootClassName } = internalProps;
const baseCls = `${rootClassName}-LoadMask`;

/**
 * Angular sibling of LoadMask (components/LoadMask.tsx): same DOM structure
 * and class names. `components.LoadMask` overrides get the same inputs:
 * `visible` and `loadingText`.
 */
@Component({
  selector: 'div[infiniteLoadMask]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [InfiniteRender],
  host: {
    '[class]': 'className()',
  },
  template: `<div [class]="overlayCls"></div><div [class]="textCls"><ng-container [infiniteRender]="text()" /></div>`,
})
export class LoadMask {
  readonly visible = input<boolean>(false);
  readonly loadingText = input<Renderable>();

  protected readonly overlayCls = `${LoadMaskOverlayCls} ${baseCls}-Overlay`;
  protected readonly textCls = `${LoadMaskTextCls} ${baseCls}-Text`;

  protected readonly className = computed(
    () => `${LoadMaskCls[this.visible() ? 'visible' : 'hidden']} ${baseCls}`,
  );

  protected readonly text = computed(() => {
    const loadingText = this.loadingText();
    return loadingText == null || loadingText === '' ? 'Loading' : loadingText;
  });
}

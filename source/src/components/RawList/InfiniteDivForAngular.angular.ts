import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

import type { Renderable } from '../types/FrameworkTypes.angular';
import { InfiniteRender } from './InfiniteRenderForAngular.angular';

/**
 * A div with a class name and renderable children - what the grid's
 * built-in render functions (group columns, ...) build their DOM with in
 * the Angular build, where React and Vue would return `<div className>`
 * JSX / `h('div')`:
 *
 * ```ts
 * renderComponent(InfiniteDiv, { inputs: { className, children: [icon, value] } })
 * ```
 */
@Component({
  selector: 'div[infiniteDiv]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [InfiniteRender],
  host: { '[class]': 'className() ?? ""' },
  template: `<ng-container [infiniteRender]="children()" />`,
})
export class InfiniteDiv {
  readonly className = input<string | null>();
  readonly children = input<Renderable>();
}

export function renderDiv(className: string | null, children: Renderable) {
  return {
    kind: 'component' as const,
    component: InfiniteDiv,
    inputs: { className, children },
  };
}

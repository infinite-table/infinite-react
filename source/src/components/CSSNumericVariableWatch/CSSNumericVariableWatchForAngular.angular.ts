import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';

import { setupResizeObserver } from '../ResizeObserver/setupResizeObserver';
import { debug, error, toWatchedCSSValue, WRAPPER_STYLE } from './shared';

/**
 * Angular sibling of CSSNumericVariableWatch.tsx - renders a hidden element
 * whose height is driven by a CSS variable, and reports (numeric) changes
 * of that variable via a ResizeObserver.
 */
@Component({
  selector: 'infinite-css-numeric-variable-watch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-name': 'css-variable-watcher',
    '[attr.data-var]': 'varName()',
    '[style]': 'wrapperStyle',
  },
  template: `<div #watched [style.height]="height()"></div>`,
})
export class CSSNumericVariableWatch {
  readonly varName = input.required<string>();
  readonly allowInts = input<boolean>(false);
  readonly onChange = input.required<(value: number) => void>();

  protected readonly wrapperStyle = WRAPPER_STYLE;

  protected readonly height = computed(() => {
    const height = toWatchedCSSValue(this.varName());
    // multiplication: supports integer (without px) values as well
    return this.allowInts() ? `calc(1px * ${height})` : height;
  });

  private readonly watched =
    viewChild.required<ElementRef<HTMLElement>>('watched');

  constructor() {
    let lastValue = 0;
    let teardown: VoidFunction | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    afterNextRender(() => {
      const node = this.watched().nativeElement;
      const varName = untracked(this.varName);
      const value = node.getBoundingClientRect().height;
      if (value != null) {
        lastValue = value;
        debug(`Variable ${varName} found and equals ${value}.`);
        untracked(this.onChange)(value);
      } else {
        error(
          `Specified variable ${varName} not found or does not have a numeric value.`,
        );
      }
      teardown = setupResizeObserver(node, ({ height }) => {
        if (height == null || timeoutId != null) {
          return;
        }
        // not from inside the observer callback: onChange changes the grid's
        // state, and the new row heights would resize observed elements again
        // in the same observation loop
        timeoutId = setTimeout(() => {
          timeoutId = null;
          const value = node.getBoundingClientRect().height;
          if (value !== lastValue) {
            lastValue = value;
            untracked(this.onChange)(value);
          }
        }, 0);
      });
    });

    inject(DestroyRef).onDestroy(() => {
      teardown?.();
      teardown = null;
      if (timeoutId != null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    });
  }
}

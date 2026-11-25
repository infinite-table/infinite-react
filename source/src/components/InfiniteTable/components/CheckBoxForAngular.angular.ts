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
  output,
  signal,
  untracked,
} from '@angular/core';

import { join } from '../../../utils/join';
import { CheckBoxCls } from './CheckBox.css';
import type { InfiniteCheckBoxPropChecked } from './CheckBoxTypes';
import type { HTMLProps } from '../../types/FrameworkTypes';

/**
 * Angular sibling of InfiniteCheckBox: the host IS the input
 * (`<input infiniteCheckBox>`, same `input.InfiniteCheckBox` DOM as React
 * and Vue). `checked` is controlled when bound (null = indeterminate),
 * `defaultChecked` uncontrolled; every click emits `(change)` and calls the
 * `[onChange]` function, which is the contract of `components.CheckBox`
 * overrides.
 */
@Component({
  selector: 'input[infiniteCheckBox]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: '',
  host: {
    type: 'checkbox',
    '[class]': 'className()',
    '[disabled]': '!!disabled()',
  },
})
export class InfiniteCheckBox {
  readonly checked = input<InfiniteCheckBoxPropChecked>();
  readonly defaultChecked = input<InfiniteCheckBoxPropChecked>();
  readonly disabled = input<boolean>();
  readonly domProps = input<HTMLProps<HTMLElement>>();
  readonly onChange = input<(checked: InfiniteCheckBoxPropChecked) => void>();
  readonly change = output<InfiniteCheckBoxPropChecked>();

  private readonly input =
    inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

  // the uncontrolled value
  private readonly localChecked = signal<InfiniteCheckBoxPropChecked>(false);
  private initialized = false;

  protected readonly className = computed(() =>
    join(
      'InfiniteCheckBox',
      CheckBoxCls,
      this.domProps()?.class,
      this.domProps()?.className,
    ),
  );

  private readonly currentChecked = computed(() => {
    const checked = this.checked();
    return checked !== undefined ? checked : this.localChecked();
  });

  constructor() {
    // a native listener, not a host `(change)` one: that would also be
    // subscribed to the `change` output of this component, and call itself
    const onChange = () => this.onInputChange();
    this.input.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() =>
      this.input.removeEventListener('change', onChange),
    );

    // writes the value to the input: a click has already toggled it, so a
    // controlled value that doesn't change after the click (or renders the
    // same: null -> false) must still reset it, as React does
    effect(() => {
      const checked = this.currentChecked();
      if (!this.initialized) {
        this.initialized = true;
        const defaultChecked = untracked(this.defaultChecked);
        if (
          untracked(this.checked) === undefined &&
          defaultChecked !== undefined
        ) {
          this.localChecked.set(defaultChecked);
          return;
        }
      }
      this.input.checked = !!checked;
      this.input.indeterminate = checked == null;
    });
  }

  protected onInputChange() {
    if (this.disabled()) {
      return;
    }
    const newChecked = !this.currentChecked();
    if (this.checked() === undefined) {
      this.localChecked.set(newChecked);
    }
    this.onChange()?.(newChecked);
    this.change.emit(newChecked);
    // the controlled value may stay the same: put it back on the input
    queueMicrotask(() => {
      const checked = untracked(this.currentChecked);
      this.input.checked = !!checked;
      this.input.indeterminate = checked == null;
    });
  }
}

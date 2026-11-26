import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
} from '@angular/core';

import { injectColumnFilterEditor } from './InfiniteTableHeader/InfiniteTableColumnHeaderFilterForAngular.angular';

/**
 * Angular siblings of the default filter editors (FilterEditors.tsx): the
 * host IS the input (`<input infiniteStringFilterEditor>`), same DOM as
 * React and Vue. Rendered in the header filter row; they read and change
 * the filter through `injectColumnFilterEditor()`.
 */
@Component({
  selector: 'input[infiniteStringFilterEditor]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    type: 'text',
    '[attr.aria-label]': 'editor.ariaLabel()',
    '[disabled]': '!!editor.disabled()',
    '[value]': 'value()',
    '[class]': 'editor.className',
    '(input)': 'onInput($event)',
  },
  template: '',
})
export class StringFilterEditor {
  protected readonly editor = injectColumnFilterEditor();

  protected readonly value = computed(
    () => (this.editor.value() as string) ?? '',
  );

  protected onInput(event: Event) {
    this.editor.setValue((event.target as HTMLInputElement).value);
  }
}

@Component({
  selector: 'input[infiniteNumberFilterEditor]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    type: 'number',
    '[attr.aria-label]': 'editor.ariaLabel()',
    '[disabled]': '!!editor.disabled()',
    '[value]': 'value()',
    '[class]': 'editor.className',
    '(input)': 'onInput($event)',
  },
  template: '',
})
export class NumberFilterEditor {
  protected readonly editor = injectColumnFilterEditor();

  protected readonly value = computed(
    () => (this.editor.value() as number) ?? '',
  );

  protected onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = isNaN(target.valueAsNumber)
      ? target.value
      : target.valueAsNumber;
    this.editor.setValue(value);
  }
}

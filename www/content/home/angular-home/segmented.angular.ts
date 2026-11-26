import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

/** The Angular port of `Segmented` (src/components/home/demos/shared.tsx). */
@Component({
  selector: 'div[homeSegmented]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'home-demo__group' },
  template: `
    <span class="home-demo__label">{{ label() }}</span>
    <div class="home-seg" role="group" [attr.aria-label]="label()">
      @for (option of options(); track option.id) {
        <button
          type="button"
          [attr.aria-pressed]="option.id === value()"
          (click)="valueChange.emit(option.id)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
})
export class Segmented<T extends string> {
  readonly label = input.required<string>();
  readonly options = input.required<readonly { id: T; label: string }[]>();
  readonly value = input.required<T>();

  readonly valueChange = output<T>();
}

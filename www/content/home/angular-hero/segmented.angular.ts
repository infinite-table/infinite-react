import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';

export type SegmentOption<V extends string | number> = {
  value: V;
  label: string;
  /** A color dot before the label. */
  swatch?: string;
  title?: string;
  disabled?: boolean;
};

/**
 * `data-hero-<name>="<value>"` on the element: the scripted show finds the
 * buttons of the hero by these (an attribute whose name is bound).
 */
@Directive({ selector: '[heroHook]' })
export class HeroHook {
  readonly name = input.required<string>({ alias: 'heroHook' });
  readonly value = input.required<string>({ alias: 'heroHookValue' });

  constructor() {
    const element: HTMLElement = inject(ElementRef).nativeElement;
    effect((onCleanup) => {
      const attribute = `data-hero-${this.name()}`;
      element.setAttribute(attribute, this.value());
      onCleanup(() => element.removeAttribute(attribute));
    });
  }
}

/** A labelled group of toggle buttons, one of them pressed. */
@Component({
  selector: 'div[heroSegmented]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroHook],
  host: {
    class: 'hero-control',
    role: 'group',
    '[attr.aria-label]': 'label()',
  },
  template: `
    <span class="hero-control__label">{{ label() }}</span>
    <div class="hero-segmented">
      @for (option of options(); track option.value) {
        <button
          type="button"
          class="hero-segmented__item"
          [attr.aria-pressed]="option.value === value()"
          [disabled]="!!option.disabled"
          [attr.title]="option.title ?? null"
          [heroHook]="hookName()"
          [heroHookValue]="'' + option.value"
          (click)="valueChange.emit(option.value)"
        >
          @if (option.swatch) {
            <span
              class="hero-swatch"
              [style.background]="option.swatch"
              aria-hidden="true"
            ></span>
          }
          {{ option.label }}
        </button>
      }
    </div>
  `,
})
export class Segmented<V extends string | number> {
  readonly label = input.required<string>();
  readonly value = input.required<V>();
  readonly options = input.required<readonly SegmentOption<V>[]>();
  /** The scripted show finds a button by its `data-hero-<hookName>` value. */
  readonly hookName = input.required<string>();

  readonly valueChange = output<V>();
}

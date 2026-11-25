/**
 * runControllerEffectsForAngular: when the framework-neutral effects run in
 * an Angular component - immediate runs in ngOnInit, 'state' effects before
 * the view is refreshed, 'dom' effects after it, mount runs after the first
 * render.
 */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import type { WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import type { ControllerEffect } from './controllerEffects';
import { runControllerEffectsForAngular } from './runControllerEffectsForAngular.angular';

type Entry = {
  name: string;
  changes: Record<string, unknown>;
  previous: Record<string, unknown>;
  first: boolean;
  /** what the view showed when the effect ran */
  text: string;
};

let createEffects: (
  source: WritableSignal<number>,
  log: (name: string, info: Omit<Entry, 'name' | 'text'>) => void,
) => ControllerEffect<any>[] = () => [];

@Component({
  selector: 'effects-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span>{{ source() }}</span>`,
})
class EffectsHost implements OnInit {
  readonly source = signal(1);
  readonly entries: (Entry | string)[] = [];
  private readonly injector = inject(Injector);
  private readonly host =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  ngOnInit() {
    const effects = createEffects(this.source, (name, info) => {
      this.entries.push({ name, ...info, text: this.host.textContent ?? '' });
    });
    runControllerEffectsForAngular(effects, { injector: this.injector });
    this.entries.push('setup done');
  }
}

function effect(
  name: string,
  source: WritableSignal<number>,
  log: (name: string, info: Omit<Entry, 'name' | 'text'>) => void,
  options: Partial<ControllerEffect<any>>,
): ControllerEffect<{ value: number }> {
  return {
    name,
    deps: () => ({ value: source() }),
    run: ({ changes, previous, first }) =>
      log(name, { changes, previous, first }),
    ...options,
  };
}

async function render() {
  const fixture = TestBed.createComponent(EffectsHost);
  await fixture.whenStable();
  return { fixture, host: fixture.componentInstance };
}

describe('runControllerEffectsForAngular', () => {
  it('an immediate effect runs in ngOnInit, then on each change', async () => {
    createEffects = (source, log) => [
      effect('state', source, log, { timing: 'state', immediate: true }),
      effect('dom', source, log, { timing: 'dom', immediate: true }),
    ];
    const { fixture, host } = await render();

    expect(host.entries).toEqual([
      {
        name: 'state',
        changes: { value: 1 },
        previous: { value: undefined },
        first: true,
        text: '',
      },
      {
        name: 'dom',
        changes: { value: 1 },
        previous: { value: undefined },
        first: true,
        text: '',
      },
      'setup done',
    ]);

    host.entries.length = 0;
    host.source.set(2);
    await fixture.whenStable();

    expect(host.entries).toEqual([
      // before the view shows the new value
      {
        name: 'state',
        changes: { value: 2 },
        previous: { value: 1 },
        first: false,
        text: '1',
      },
      // after
      {
        name: 'dom',
        changes: { value: 2 },
        previous: { value: 1 },
        first: false,
        text: '2',
      },
    ]);
  });

  it('a plain effect only runs when a dep changes, dom timing by default', async () => {
    createEffects = (source, log) => [effect('dom', source, log, {})];
    const { fixture, host } = await render();

    expect(host.entries).toEqual(['setup done']);

    host.entries.length = 0;
    host.source.set(2);
    await fixture.whenStable();
    expect(host.entries).toEqual([
      {
        name: 'dom',
        changes: { value: 2 },
        previous: { value: 1 },
        first: false,
        text: '2',
      },
    ]);
  });

  it('a mount run happens after the first render', async () => {
    createEffects = (source, log) => [
      effect('mount', source, log, { runOnMount: true }),
    ];
    const { host } = await render();

    expect(host.entries).toEqual([
      'setup done',
      {
        name: 'mount',
        changes: { value: 1 },
        previous: { value: undefined },
        first: true,
        text: '1',
      },
    ]);
  });
});

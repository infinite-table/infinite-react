/**
 * The Angular managed-state adapter (useManagedComponent.angular.ts):
 * controlled/uncontrolled props with model() inputs.
 */
import { Component, OnInit, input, model, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { afterEach, describe, expect, it } from 'vitest';

import type { AngularPropsMeta } from './angularPropsMeta';
import { buildManagedAngularComponent } from './useManagedComponent.angular';

type Props = {
  value?: string;
  defaultValue?: string;
  label?: string;
  onValueChange?: (value: string) => void;
};

type State = {
  value: string;
  valueWasControlled: boolean;
  label: string | undefined;
};

const counters = { reducerRuns: 0, cleanups: 0 };

const META: AngularPropsMeta = {
  inputs: ['defaultValue', 'label'],
  models: ['value'],
  callbacks: { onValueChange: { model: 'value', fn: false } },
};

const injectManaged = buildManagedAngularComponent<Props, { value: string }, {}, any>({
  // undefined -> '' : a reset is visible in the state
  forwardProps: () => ({ value: (value: string | undefined) => value ?? '' }) as any,
  mapPropsToState: ({ props }) => ({
    valueWasControlled: props.value !== undefined,
    label: props.label,
  }),
  concludeReducer: ({ state }) => {
    counters.reducerRuns++;
    return state;
  },
  cleanup: () => {
    counters.cleanups++;
  },
});

@Component({ selector: 'managed-host', template: '' })
class ManagedHost implements OnInit {
  readonly value = model<string>();
  readonly defaultValue = input<string>();
  readonly label = input<string>();
  readonly managed = injectManaged(this, META);
  ngOnInit() {
    this.managed.init();
  }
  get state(): State {
    return this.managed.context.getComponentState() as unknown as State;
  }
  set(value: string) {
    (this.managed.context.componentActions as any).value = value;
  }
}

@Component({
  imports: [ManagedHost],
  template: `<managed-host defaultValue="d" [label]="label()" />`,
})
class Unbound {
  readonly label = signal('x');
}

@Component({
  imports: [ManagedHost],
  template: `<managed-host [(value)]="value" />`,
})
class TwoWay {
  readonly value = signal<string | undefined>('a');
}

@Component({
  imports: [ManagedHost],
  template: `<managed-host [(value)]="value" />`,
})
class TwoWayStartingUndefined {
  readonly value = signal<string | undefined>(undefined);
}

@Component({
  imports: [ManagedHost],
  template: `<managed-host [value]="value()" (valueChange)="changes.push($event)" />`,
})
class OneWay {
  readonly value = signal<string>('a');
  readonly changes: (string | undefined)[] = [];
}

async function render<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  await fixture.whenStable();
  const host = fixture.debugElement.query(By.directive(ManagedHost))
    .componentInstance as ManagedHost;
  return { fixture, host, parent: fixture.componentInstance };
}

describe('Angular managed component', () => {
  afterEach(() => {
    counters.reducerRuns = 0;
    counters.cleanups = 0;
  });

  it('the first prop-diff run is a no-op', async () => {
    const { host } = await render(Unbound);
    expect(host.state.value).toBe('d');
    expect(counters.reducerRuns).toBe(0);
  });

  it('an unbound model stays uncontrolled after the grid writes it', async () => {
    const { fixture, host } = await render(Unbound);

    host.set('b');
    await fixture.whenStable();

    expect(host.state.value).toBe('b');
    expect(host.value()).toBe('b');
    // the shared code doesn't see the grid's own write as a controlled value
    expect(host.managed.getProps().value).toBeUndefined();
    expect(host.state.valueWasControlled).toBe(false);

    host.set('c');
    await fixture.whenStable();
    expect(host.state.value).toBe('c');
    expect(host.state.valueWasControlled).toBe(false);
  });

  it('a changed non-model input re-derives the state', async () => {
    const { fixture, host, parent } = await render(Unbound);
    expect(host.state.label).toBe('x');

    parent.label.set('y');
    await fixture.whenStable();
    expect(host.state.label).toBe('y');
  });

  it('[(value)]: the change reaches the parent, dispatched once', async () => {
    const { fixture, host, parent } = await render(TwoWay);
    expect(host.state.value).toBe('a');
    expect(host.state.valueWasControlled).toBe(true);

    host.set('b');
    await fixture.whenStable();

    expect(parent.value()).toBe('b');
    expect(host.state.value).toBe('b');
    // the setter's dispatch only - the value coming back isn't diffed again
    expect(counters.reducerRuns).toBe(1);
  });

  it('[(value)]: a value the parent pushes wins, undefined resets', async () => {
    const { fixture, host, parent } = await render(TwoWay);

    parent.value.set('c');
    await fixture.whenStable();
    expect(host.state.value).toBe('c');

    parent.value.set(undefined);
    await fixture.whenStable();
    expect(host.state.value).toBe('');
    expect(host.state.valueWasControlled).toBe(false);
  });

  it('[(value)] starting undefined: a parent push of undefined resets', async () => {
    const { fixture, host, parent } = await render(TwoWayStartingUndefined);

    host.set('b');
    await fixture.whenStable();
    expect(parent.value()).toBe('b');
    expect(host.state.value).toBe('b');

    parent.value.set(undefined);
    await fixture.whenStable();
    expect(host.state.value).toBe('');
  });

  it('[value] one-way: the grid applies its change, the parent value wins later', async () => {
    const { fixture, host, parent } = await render(OneWay);

    host.set('b');
    await fixture.whenStable();
    // Angular has no locked prop: the model takes the grid's value
    expect(host.state.value).toBe('b');
    expect(host.value()).toBe('b');
    expect(parent.changes).toEqual(['b']);
    expect(parent.value()).toBe('a');

    parent.value.set('c');
    await fixture.whenStable();
    expect(host.state.value).toBe('c');
  });

  it('writing the current value runs the reducer, without a change event', async () => {
    const { fixture, host, parent } = await render(OneWay);

    host.set('a');
    await fixture.whenStable();
    expect(counters.reducerRuns).toBe(1);
    expect(parent.changes).toEqual([]);
  });

  it('cleanup runs when the component is destroyed', async () => {
    const { fixture } = await render(Unbound);
    fixture.destroy();
    expect(counters.cleanups).toBe(1);
  });
});

/**
 * InfiniteRender in content projected into a component: the text leaves are
 * DOM nodes next to the anchor comment, not views, so the outlet places
 * them itself when the anchor gets (or changes) its parent.
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import {
  InfiniteRender,
  renderComponent,
} from './InfiniteRenderForAngular.angular';

// read by the wrappers: set from the tests, outside the host's view
const open = signal(true);

@Component({
  selector: 'direct-wrapper',
  template: `<i><ng-content /></i>`,
})
class DirectWrapper {}

// the <ng-content> is rendered after the host's outlets got their content
@Component({
  selector: 'if-wrapper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<i>@if (open()) {<ng-content />}</i>`,
})
class IfWrapper {
  protected readonly open = open;
}

@Component({
  selector: 'test-badge',
  template: `<u>badge</u>`,
})
class Badge {}

@Component({
  selector: 'render-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InfiniteRender, DirectWrapper, IfWrapper],
  template: `<direct-wrapper><ng-container [infiniteRender]="text()" /></direct-wrapper><if-wrapper><ng-container [infiniteRender]="text()" /></if-wrapper><if-wrapper><ng-container [infiniteRender]="['a ', bold, ' b ', badge, ' c']" /></if-wrapper><ng-template #bold><b>bold</b></ng-template>`,
})
class RenderHost {
  readonly text = signal('Hello');
  readonly badge = renderComponent(Badge);
}

async function render() {
  open.set(true);
  const fixture = TestBed.createComponent(RenderHost);
  const host = fixture.componentInstance;
  await fixture.whenStable();
  const wrappers = () =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('i'),
    ).map((i) => i.textContent);
  return { fixture, host, wrappers };
}

describe('InfiniteRender in projected content', () => {
  it('shows text, templates and components when the <ng-content> is rendered later', async () => {
    const { wrappers } = await render();

    expect(wrappers()).toEqual(['Hello', 'Hello', 'a bold b badge c']);
  });

  it('updates the text in place', async () => {
    const { fixture, host, wrappers } = await render();
    const textNode = (fixture.nativeElement as HTMLElement).querySelectorAll(
      'i',
    )[1].firstChild;
    expect(textNode?.nodeType).toBe(Node.TEXT_NODE);

    host.text.set('World');
    await fixture.whenStable();

    expect(wrappers()).toEqual(['World', 'World', 'a bold b badge c']);
    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('i')[1]
        .firstChild,
    ).toBe(textNode);
  });

  it('follows the wrapper removing and rendering its <ng-content> again', async () => {
    const { fixture, host, wrappers } = await render();

    // only the wrappers' views are checked (the host isn't dirty)
    open.set(false);
    await fixture.whenStable();
    expect(wrappers()).toEqual(['Hello', '', '']);

    // the text changes while the wrapper doesn't render it
    host.text.set('World');
    await fixture.whenStable();
    expect(wrappers()).toEqual(['World', '', '']);

    open.set(true);
    await fixture.whenStable();
    expect(wrappers()).toEqual(['World', 'World', 'a bold b badge c']);
  });
});

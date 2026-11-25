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
  untracked,
} from '@angular/core';

import { join } from '../../../../utils/join';
import { styleWithUnits } from '../../../../utils/styleWithUnits';
import { InfiniteRender } from '../../../RawList/InfiniteRenderForAngular.angular';
import type {
  CSSProperties,
  HTMLAttributes,
  Renderable,
} from '../../../types/FrameworkTypes';
import { ThemeVars } from '../../vars.css';

import { HeaderMenuIconCls } from '../InfiniteTableHeader/header.css';
import { InfiniteIconClassName } from './InfiniteIconClassName';
import { MenuIconLineCls, MenuIconWithDefaultLinesCls } from './MenuIcon.css';
import { MenuIconDataAttributesValues } from './menuIconAttributes';

const defaultLineStyle: Record<string, any> = {
  width: '100%',
  pointerEvents: 'none',
};

const lineClassName = join(`${InfiniteIconClassName}-menu`, MenuIconLineCls);

const NOT_ATTRIBUTES = new Set(['class', 'className', 'style', 'children']);

/**
 * Applies `domProps` to an element the component doesn't render itself:
 * `onXxx` functions become native listeners (`onMouseDown` -> `mousedown`),
 * the other keys attributes (class and style are bound by the component).
 * Returns the cleanup.
 */
function applyDomProps(
  element: HTMLElement,
  domProps: HTMLAttributes<HTMLElement> | null | undefined,
): VoidFunction {
  if (!domProps) {
    return () => {};
  }
  const listeners: [string, EventListener][] = [];
  const attributes: string[] = [];

  for (const key in domProps) {
    const value = (domProps as Record<string, any>)[key];
    if (NOT_ATTRIBUTES.has(key)) {
      continue;
    }
    if (/^on[A-Z]/.test(key)) {
      if (typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, value);
        listeners.push([eventName, value]);
      }
      continue;
    }
    if (value == null || value === false) {
      continue;
    }
    element.setAttribute(key, value === true ? '' : String(value));
    attributes.push(key);
  }

  return () => {
    listeners.forEach(([eventName, listener]) =>
      element.removeEventListener(eventName, listener),
    );
    attributes.forEach((name) => element.removeAttribute(name));
  };
}

/**
 * Angular sibling of MenuIcon - the 3-lines icon in header cells that opens
 * the column menu. The host IS the icon div (`<div infiniteMenuIcon>`),
 * same DOM, class names and data attributes as React and Vue.
 *
 * `children` replaces the default lines (a `renderMenuIcon` result is
 * rendered this way). A pointer down on the icon never reaches the header
 * cell (no sorting, no column drag). `components.MenuIcon` overrides get the
 * same inputs.
 */
@Component({
  selector: 'div[infiniteMenuIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [InfiniteRender],
  host: {
    '[attr.data-name]': 'dataName',
    '[style]': 'hostStyle()',
    '[class]': 'hostClassName()',
  },
  template: `@if (hasChildren()) {<ng-container
      [infiniteRender]="children()"
    />} @else {
    <div [class]="lineClassName" [style]="lineStyleValue()"></div>
    <div [class]="lineClassName" [style]="lineStyleValue()"></div>
    <div [class]="lineClassName" [style]="lineStyleValue()"></div>
    }`,
})
export class MenuIcon {
  readonly lineWidth = input<number>();
  readonly lineStyle = input<CSSProperties | null>();
  readonly style = input<CSSProperties | null>();
  readonly className = input<string>();
  readonly domProps = input<HTMLAttributes<HTMLDivElement> | null>();
  readonly reserveSpaceWhenHidden = input<boolean>();
  readonly menuVisible = input<boolean>();
  readonly children = input<Renderable>();

  protected readonly dataName = MenuIconDataAttributesValues['data-name'];
  protected readonly lineClassName = lineClassName;

  private readonly element =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly hasChildren = computed(() => this.children() != null);

  protected readonly hostStyle = computed(() =>
    styleWithUnits(this.style() as Record<string, any> | null),
  );

  protected readonly hostClassName = computed(() =>
    join(
      this.className(),
      HeaderMenuIconCls({
        menuVisible: !!this.menuVisible(),
        reserveSpaceWhenHidden: !!this.reserveSpaceWhenHidden(),
      }),
      InfiniteIconClassName,
      `${InfiniteIconClassName}-menu`,
      this.hasChildren() ? '' : MenuIconWithDefaultLinesCls,
    ),
  );

  protected readonly lineStyleValue = computed(() => ({
    ...defaultLineStyle,
    borderTop: `${ThemeVars.components.HeaderCell.menuIconLineWidth} solid currentColor`,
    ...styleWithUnits(this.lineStyle() as Record<string, any> | null),
  }));

  constructor() {
    const element = this.element;
    const onPointerDown = (event: PointerEvent) => {
      event.stopPropagation();
    };
    element.addEventListener('pointerdown', onPointerDown);

    let cleanupDomProps: VoidFunction = () => {};
    effect(() => {
      const domProps = this.domProps();
      untracked(() => {
        cleanupDomProps();
        cleanupDomProps = applyDomProps(element, domProps);
      });
    });

    inject(DestroyRef).onDestroy(() => {
      element.removeEventListener('pointerdown', onPointerDown);
      cleanupDomProps();
    });
  }
}

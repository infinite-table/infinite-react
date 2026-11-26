import {
  InjectionToken,
  Injector,
  Signal,
  TemplateRef,
  WritableSignal,
  signal,
} from '@angular/core';

import type { Renderable } from '../types/FrameworkTypes.angular';
import {
  isComponentRenderable,
  isTemplateRenderable,
} from './InfiniteRenderForAngular.angular';

/**
 * The context a render hook's result is rendered with, kept by the cell (or
 * header cell) for one stage of its render bag: an injector providing the
 * param under the cell's token, and the param signal behind it.
 *
 * Stable for the life of the cell, so a recycled cell keeps the views of its
 * templates and components - only the param changes.
 */
export type RenderStage<P> = {
  readonly injector: Injector;
  readonly param: WritableSignal<P>;
};

export function createRenderStage<P>(
  token: InjectionToken<Signal<P>>,
  parentInjector: Injector,
): RenderStage<P> {
  const param = signal<P>(null as any as P, { equal: () => false });
  return {
    param,
    injector: Injector.create({
      providers: [{ provide: token, useValue: param.asReadonly() }],
      parent: parentInjector,
    }),
  };
}

/**
 * Binds what a render hook returned (`renderValue`, `header`, an icon
 * hook, ...) to the param the hook was called with - the Angular equivalent
 * of Vue's RenderCellHookWrapper / React's RenderHookComponent:
 * - a template gets the param as its context: `$implicit` is the value
 *   (`let-value`), every param property is available (`let-rowInfo="rowInfo"`),
 *   and the components inside can inject the param (`injectColumnCell()`)
 * - a component gets the stage injector (same) and its inputs named like a
 *   param property get that property
 * - primitives and already-bound content are returned as they are
 *
 * The render bag is staged (value, then icons, then `all`), so each hook has
 * to see the param of its own stage: binding when the hook runs is what makes
 * `renderBag.value` inside a `render` template render the value of the
 * `renderValue` stage instead of recursing.
 */
export function bindRenderable<P extends object>(
  content: Renderable | unknown,
  param: P,
  stage: RenderStage<P>,
  implicit: (param: P) => unknown,
): Renderable {
  stage.param.set(param);
  return bind(content, param, stage, implicit);
}

function bind<P extends object>(
  content: Renderable | unknown,
  param: P,
  stage: RenderStage<P>,
  implicit: (param: P) => unknown,
): Renderable {
  if (content == null || typeof content !== 'object') {
    return content as Renderable;
  }
  if (Array.isArray(content)) {
    return content.map((item) => bind(item, param, stage, implicit));
  }
  if (content instanceof TemplateRef) {
    return {
      kind: 'template',
      template: content,
      context: { ...param, $implicit: implicit(param) },
      injector: stage.injector,
    };
  }
  if (isTemplateRenderable(content)) {
    if (content.context !== undefined && content.injector) {
      return content;
    }
    return {
      ...content,
      context:
        content.context !== undefined
          ? content.context
          : { ...param, $implicit: implicit(param) },
      injector: content.injector ?? stage.injector,
    };
  }
  if (isComponentRenderable(content)) {
    if (content.injector) {
      return content;
    }
    return {
      ...content,
      injector: stage.injector,
      // the outlet only sets the inputs the component declares
      inputs: { ...(param as Record<string, unknown>), ...content.inputs },
    };
  }
  return content as Renderable;
}

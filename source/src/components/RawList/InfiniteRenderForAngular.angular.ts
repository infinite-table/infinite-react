import {
  AfterRenderRef,
  AfterViewChecked,
  ComponentRef,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  Injector,
  OnChanges,
  OnDestroy,
  TemplateRef,
  Type,
  ViewContainerRef,
  afterEveryRender,
  inject,
  input,
  inputBinding,
  outputBinding,
  reflectComponentType,
} from '@angular/core';

import type {
  ComponentRenderable,
  Renderable,
  TemplateRenderable,
} from '../types/FrameworkTypes.angular';

/**
 * Renders `template` with `context` where a Renderable is accepted
 * (`renderValue`, `header`, menu labels, ...).
 *
 * A bare `TemplateRef` is rendered with the context of the place it is
 * rendered at (the cell, the header, ...); use this to pass another one.
 */
export function renderTemplate<C>(
  template: TemplateRef<C>,
  context?: C,
  injector?: Injector,
): TemplateRenderable<C> {
  return { kind: 'template', template, context, injector };
}

/**
 * Renders `component` where a Renderable is accepted.
 *
 * The inputs of the component that have the name of a property of the
 * context it is rendered with (`value`, `rowInfo`, `column`, `data`, ...) get
 * that value; `inputs` are set on top.
 */
export function renderComponent<C>(
  component: Type<C>,
  options?: {
    inputs?: Record<string, unknown>;
    outputs?: Record<string, (value: any) => void>;
    injector?: Injector;
  },
): ComponentRenderable<C> {
  return {
    kind: 'component',
    component,
    inputs: options?.inputs,
    outputs: options?.outputs,
    injector: options?.injector,
  };
}

export function isTemplateRenderable(
  value: unknown,
): value is TemplateRenderable {
  return (
    value != null &&
    typeof value === 'object' &&
    (value as TemplateRenderable).kind === 'template'
  );
}

export function isComponentRenderable(
  value: unknown,
): value is ComponentRenderable {
  return (
    value != null &&
    typeof value === 'object' &&
    (value as ComponentRenderable).kind === 'component'
  );
}

type TextLeaf = { kind: 'text'; text: string };
type TemplateLeaf = {
  kind: 'template';
  template: TemplateRef<any>;
  context: any;
  injector?: Injector;
};
type ComponentLeaf = {
  kind: 'component';
  component: Type<unknown>;
  context: any;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, (value: any) => void>;
  injector?: Injector;
};
type Leaf = TextLeaf | TemplateLeaf | ComponentLeaf;

/**
 * Flattens a Renderable into the list of things to render. Empty values
 * (null, undefined, booleans) render nothing, as in React.
 */
export function flattenRenderable(
  content: Renderable | unknown,
  context: unknown,
  leaves: Leaf[] = [],
): Leaf[] {
  if (content == null || typeof content === 'boolean' || content === '') {
    return leaves;
  }
  if (typeof content === 'string') {
    leaves.push({ kind: 'text', text: content });
    return leaves;
  }
  if (typeof content === 'number' || typeof content === 'bigint') {
    leaves.push({ kind: 'text', text: String(content) });
    return leaves;
  }
  if (Array.isArray(content)) {
    for (let i = 0; i < content.length; i++) {
      flattenRenderable(content[i], context, leaves);
    }
    return leaves;
  }
  if (content instanceof TemplateRef) {
    leaves.push({ kind: 'template', template: content, context });
    return leaves;
  }
  if (isTemplateRenderable(content)) {
    leaves.push({
      kind: 'template',
      template: content.template,
      context: content.context !== undefined ? content.context : context,
      injector: content.injector,
    });
    return leaves;
  }
  if (isComponentRenderable(content)) {
    leaves.push({
      kind: 'component',
      component: content.component,
      context,
      inputs: content.inputs,
      outputs: content.outputs,
      injector: content.injector,
    });
    return leaves;
  }
  if (typeof content === 'function') {
    if (__DEV__) {
      console.error(
        'InfiniteRender: got a function. A component class must be wrapped: renderComponent(Cmp).',
        content,
      );
    }
    return leaves;
  }
  // dates and other objects: their string form, like the default formatting
  leaves.push({ kind: 'text', text: String(content) });
  return leaves;
}

type RenderedLeaf =
  | { kind: 'text'; node: Text }
  | {
      kind: 'template';
      template: TemplateRef<any>;
      view: EmbeddedViewRef<any>;
      holder: { context: any };
      injector?: Injector;
    }
  | {
      kind: 'component';
      component: Type<unknown>;
      ref: ComponentRef<unknown>;
      holder: ComponentHolder;
      injector?: Injector;
    };

type ComponentHolder = {
  context: any;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, (value: any) => void>;
};

/**
 * The context the views of a template leaf are created with: it forwards
 * every read to the current context, so a cell recycled for another row
 * keeps its view and only swaps the context (the technique NgTemplateOutlet
 * uses).
 */
function createForwardingContext(holder: { context: any }) {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        const context = holder.context;
        return context == null ? undefined : Reflect.get(context, prop);
      },
      has(_target, prop) {
        const context = holder.context;
        return context != null && typeof context === 'object'
          ? prop in context
          : false;
      },
    },
  );
}

/**
 * Renders a Renderable: text, a TemplateRef, `renderTemplate()` /
 * `renderComponent()` descriptors or an array of those.
 *
 * ```html
 * <ng-template infiniteCell="firstName" let-renderBag="renderBag">
 *   <b><ng-container [infiniteRender]="renderBag.value" /></b>
 * </ng-template>
 * ```
 *
 * `[infiniteRenderContext]` is the context templates (and the inputs of
 * components) get when the content doesn't carry its own.
 *
 * Text is a DOM node next to the anchor comment, not a view, so Angular
 * doesn't move it: when the outlet is content projected into a component
 * that renders its `<ng-content>` later (in an `@if`, a `@for`, ...) or
 * renders it again, the outlet puts its nodes next to the anchor itself
 * once the anchor is in its new place.
 */
@Directive({
  selector: 'ng-container[infiniteRender]',
})
export class InfiniteRender implements OnChanges, AfterViewChecked, OnDestroy {
  readonly content = input<Renderable | unknown>(undefined, {
    alias: 'infiniteRender',
  });
  readonly context = input<unknown>(undefined, {
    alias: 'infiniteRenderContext',
  });

  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly anchor = inject<ElementRef<Comment>>(ElementRef);

  private rendered: RenderedLeaf[] = [];

  /**
   * The parent the nodes were last put in: null when the anchor had none
   * (content projected into a component that hasn't rendered it yet),
   * undefined before the first check
   */
  private placedIn: Node | null | undefined = undefined;
  /** see watchPlacement */
  private placementWatch: AfterRenderRef | null = null;

  ngOnChanges() {
    this.reconcile(flattenRenderable(this.content(), this.context()));
  }

  /**
   * After the components of this view rendered: a component this outlet is
   * projected into puts the anchor in place when it renders its
   * `<ng-content>`, which can be after ngOnChanges (in an `@if`). In a
   * cell the anchor is in place from the start: one comparison.
   */
  ngAfterViewChecked() {
    if (this.anchor.nativeElement.parentNode !== this.placedIn) {
      this.placeNodes();
    }
  }

  ngOnDestroy() {
    this.placementWatch?.destroy();
    this.placementWatch = null;
    this.clear();
  }

  private clear() {
    for (const leaf of this.rendered) {
      if (leaf.kind === 'text') {
        leaf.node.remove();
      }
    }
    this.vcr.clear();
    this.rendered = [];
  }

  private reconcile(leaves: Leaf[]) {
    const rendered = this.rendered;

    // the common case while scrolling: one text before, one text now
    if (
      leaves.length === 1 &&
      rendered.length === 1 &&
      leaves[0].kind === 'text' &&
      rendered[0].kind === 'text'
    ) {
      const node = rendered[0].node;
      const text = leaves[0].text;
      if (node.data !== text) {
        node.data = text;
      }
      return;
    }

    let structureChanged = leaves.length !== rendered.length;
    const next: RenderedLeaf[] = [];
    let toRefresh: ComponentRef<unknown>[] | null = null;
    let viewIndex = 0;

    for (let i = 0; i < leaves.length; i++) {
      const leaf = leaves[i];
      const current = rendered[i];

      if (leaf.kind === 'text') {
        if (current?.kind === 'text') {
          if (current.node.data !== leaf.text) {
            current.node.data = leaf.text;
          }
          next.push(current);
        } else {
          this.destroyLeaf(current);
          structureChanged = true;
          next.push({ kind: 'text', node: document.createTextNode(leaf.text) });
        }
        continue;
      }

      if (
        leaf.kind === 'template' &&
        current?.kind === 'template' &&
        current.template === leaf.template &&
        current.injector === leaf.injector
      ) {
        current.holder.context = leaf.context;
        next.push(current);
        viewIndex++;
        continue;
      }

      if (
        leaf.kind === 'component' &&
        current?.kind === 'component' &&
        current.component === leaf.component &&
        current.injector === leaf.injector
      ) {
        if (
          current.holder.context !== leaf.context ||
          current.holder.inputs !== leaf.inputs
        ) {
          current.holder.context = leaf.context;
          current.holder.inputs = leaf.inputs;
          (toRefresh ??= []).push(current.ref);
        }
        current.holder.outputs = leaf.outputs;
        next.push(current);
        viewIndex++;
        continue;
      }

      this.destroyLeaf(current);
      structureChanged = true;

      if (leaf.kind === 'template') {
        const holder = { context: leaf.context };
        const view = this.vcr.createEmbeddedView(
          leaf.template,
          createForwardingContext(holder),
          { index: viewIndex, injector: leaf.injector ?? this.injector },
        );
        next.push({
          kind: 'template',
          template: leaf.template,
          view,
          holder,
          injector: leaf.injector,
        });
      } else {
        const holder: ComponentHolder = {
          context: leaf.context,
          inputs: leaf.inputs,
          outputs: leaf.outputs,
        };
        const ref = this.vcr.createComponent(leaf.component, {
          index: viewIndex,
          injector: leaf.injector ?? this.injector,
          bindings: componentBindings(leaf, holder),
        });
        next.push({
          kind: 'component',
          component: leaf.component,
          ref,
          holder,
          injector: leaf.injector,
        });
      }
      viewIndex++;
    }

    for (let i = leaves.length; i < rendered.length; i++) {
      this.destroyLeaf(rendered[i]);
    }

    this.rendered = next;

    if (structureChanged) {
      this.placeNodes();
    }

    // Reused components with new inputs: the input bindings are evaluated
    // when the component's host view is refreshed, and the host view of an
    // OnPush component is not CheckAlways - the parent's refresh skips it,
    // so it would keep its old inputs. detectChanges() refreshes just that
    // view (markForCheck() would mark every ancestor up to the app root and
    // schedule an app-wide check, eg after every scroll frame).
    if (toRefresh) {
      for (const ref of toRefresh) {
        ref.changeDetectorRef.detectChanges();
      }
    }
  }

  private destroyLeaf(leaf: RenderedLeaf | undefined) {
    if (!leaf) {
      return;
    }
    if (leaf.kind === 'text') {
      leaf.node.remove();
    } else if (leaf.kind === 'template') {
      leaf.view.destroy();
    } else {
      leaf.ref.destroy();
    }
  }

  /**
   * Puts the DOM nodes of the leaves, in order, before the anchor comment.
   * Views are created in the container in leaf order, but text nodes are
   * not views, so the order is fixed up whenever the leaves change or the
   * anchor moves.
   *
   * Without a parent (projected content not rendered yet, or taken out by
   * the component it is projected into), Angular keeps the views out of
   * the DOM: so does the text, until the anchor is back.
   */
  private placeNodes() {
    const anchor = this.anchor.nativeElement;
    const parent = anchor.parentNode;
    this.placedIn = parent;
    if (!parent) {
      for (const leaf of this.rendered) {
        if (leaf.kind === 'text') {
          leaf.node.remove();
        }
      }
      this.watchPlacement();
      return;
    }
    for (const leaf of this.rendered) {
      if (leaf.kind === 'text') {
        parent.insertBefore(leaf.node, anchor);
      } else if (leaf.kind === 'template') {
        for (const node of leaf.view.rootNodes) {
          parent.insertBefore(node, anchor);
        }
      } else {
        parent.insertBefore(leaf.ref.location.nativeElement, anchor);
      }
    }
  }

  /**
   * Once the anchor was seen without a parent, the outlet is projected
   * content: the component it is projected into can render (or remove) its
   * `<ng-content>` in a check of its own view only (a signal it reads),
   * which doesn't run ngAfterViewChecked here. So from then on the
   * placement is also checked after every render.
   */
  private watchPlacement() {
    if (this.placementWatch) {
      return;
    }
    this.placementWatch = afterEveryRender(
      {
        write: () => {
          if (this.anchor.nativeElement.parentNode !== this.placedIn) {
            this.placeNodes();
          }
        },
      },
      { injector: this.injector },
    );
  }
}

const INPUT_NAMES = new WeakMap<Type<unknown>, string[]>();

function getInputNames(component: Type<unknown>): string[] {
  let names = INPUT_NAMES.get(component);
  if (!names) {
    names = (reflectComponentType(component)?.inputs ?? []).map(
      (input) => input.templateName,
    );
    INPUT_NAMES.set(component, names);
  }
  return names;
}

function componentBindings(leaf: ComponentLeaf, holder: ComponentHolder) {
  const bindings = [];
  const context = leaf.context;
  for (const name of getInputNames(leaf.component)) {
    const fromContext =
      context != null && typeof context === 'object' && name in context;
    const fromInputs = !!leaf.inputs && name in leaf.inputs;
    if (fromContext || fromInputs) {
      bindings.push(
        inputBinding(name, () =>
          holder.inputs && name in holder.inputs
            ? holder.inputs[name]
            : holder.context?.[name],
        ),
      );
    }
  }
  if (leaf.outputs) {
    for (const name in leaf.outputs) {
      // through the holder: a reused component calls the listeners of the
      // latest content, not the ones it was created with
      bindings.push(
        outputBinding(name, (value: unknown) =>
          holder.outputs?.[name]?.(value),
        ),
      );
    }
  }
  return bindings;
}

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  InjectionToken,
  Injector,
  Signal,
  TemplateRef,
  Type,
  ViewEncapsulation,
  inject,
  signal,
} from '@angular/core';

import { join } from '../../../../utils/join';
import {
  renderComponent,
  renderTemplate,
} from '../../../RawList/InfiniteRenderForAngular.angular';
import type { Renderable } from '../../../types/FrameworkTypes.angular';
import { absoluteCover, outline } from '../../utilities.css';

import type { InfiniteTableApi } from '../../types/InfiniteTableProps';
import type { InfiniteTableState } from '../../types/InfiniteTableState';
import type {
  InfiniteTableColumnCellContextType,
  InfiniteTableComputedColumn,
} from '../../types/InfiniteTableColumn';
import type { InfiniteTableRowInfo } from '../../types';

/**
 * What `injectColumnEditor()` returns, and the context of a template editor
 * (`$implicit`, plus every property by name): the editing contract of
 * `useInfiniteColumnEditor` in React and Vue, with `value` and `readOnly` as
 * signals.
 */
export type InfiniteColumnEditorContextForAngular<T = any> = {
  api: InfiniteTableApi<T>;
  /** the value the edit started with - captured once, when editing starts */
  initialValue: any;
  /** the current value (what `setValue` was last called with) */
  value: Signal<any>;
  /**
   * true while the edit is being accepted/persisted (eg a lazy
   * `shouldAcceptEdit` is pending)
   */
  readOnly: Signal<boolean>;
  column: InfiniteTableComputedColumn<T>;
  rowInfo: InfiniteTableRowInfo<T>;
  /** call it as the user types: `confirmEdit()` persists the last value */
  setValue: (value: any) => void;
  confirmEdit: InfiniteTableApi<T>['confirmEdit'];
  cancelEdit: InfiniteTableApi<T>['cancelEdit'];
  rejectEdit: InfiniteTableApi<T>['rejectEdit'];
};

/**
 * The editing session of a cell: one per edit (created when the cell starts
 * being edited, dropped when the editor goes away), so the editor is created
 * once per edit and survives the cell re-renders that happen while it is
 * open (eg `readOnly` flipping while the edit is persisted).
 */
export type ColumnEditorSession<T = any> = {
  /** `${rowId}:${columnId}` */
  readonly key: string;
  readonly context: InfiniteColumnEditorContextForAngular<T>;
  /**
   * Provides the editor context (`injectColumnEditor()`), on top of the cell
   * (`injectColumnCell()`)
   */
  readonly injector: Injector;
  /** whether editingCell was active on the last render */
  active: boolean;
  /**
   * For template editors: the cell focuses the focus target (or the first
   * focusable element) once the template view exists. null until the editor
   * was rendered, then true until it was focused (once per edit).
   */
  focusPending: boolean | null;
  /** the element marked with `infiniteEditorInput` */
  focusTarget: HTMLElement | null;
  readonly getState: () => InfiniteTableState<T>;
  /** called by the cell on every render while editing */
  update(editingCell: InfiniteTableState<T>['editingCell']): void;
};

const INFINITE_COLUMN_EDITOR = new InjectionToken<ColumnEditorSession<any>>(
  'INFINITE_COLUMN_EDITOR',
);

/**
 * In the editor of a cell (`column.components.Editor`, or a component inside
 * an editor template): the editing contract - `initialValue`, `value` and
 * `readOnly` (signals), `setValue`, `confirmEdit`, `cancelEdit`,
 * `rejectEdit`. The Angular `useInfiniteColumnEditor()`.
 *
 * ```ts
 * @Component({
 *   selector: 'input[myEditor]',
 *   template: '',
 *   host: { '(input)': 'editor.setValue($any($event.target).value)', '(keydown.enter)': 'editor.confirmEdit()' },
 * })
 * class MyEditor {
 *   readonly editor = injectColumnEditor();
 * }
 * ```
 */
export function injectColumnEditor<
  T = any,
>(): InfiniteColumnEditorContextForAngular<T> {
  return inject(INFINITE_COLUMN_EDITOR).context;
}

function getReadOnly(editingCell: InfiniteTableState<any>['editingCell']) {
  return editingCell
    ? !editingCell.active && !!(editingCell as { waiting?: unknown }).waiting
    : false;
}

/**
 * Starts the editing session of a cell (called by the body cell when it
 * enters edit mode).
 */
export function createColumnEditorSession<T>(params: {
  key: string;
  renderParam: InfiniteTableColumnCellContextType<T>;
  getState: () => InfiniteTableState<T>;
  parentInjector: Injector;
}): ColumnEditorSession<T> {
  const { key, renderParam, getState, parentInjector } = params;
  const { api, column, rowInfo } = renderParam;
  const { editingCell, editingValueRef } = getState();

  // captured once, when editing starts - same as React's useState initializer
  const initialValue = editingCell?.value;
  editingValueRef.current = initialValue;

  const value = signal<any>(initialValue);
  const readOnly = signal(getReadOnly(editingCell));

  const context: InfiniteColumnEditorContextForAngular<T> = {
    api,
    initialValue,
    value: value.asReadonly(),
    readOnly: readOnly.asReadonly(),
    column,
    rowInfo,
    setValue: (newValue: any) => {
      editingValueRef.current = newValue;
      value.set(newValue);
    },
    confirmEdit: api.confirmEdit,
    cancelEdit: api.cancelEdit,
    rejectEdit: api.rejectEdit,
  };

  const session: ColumnEditorSession<T> = {
    key,
    context,
    injector: null as any as Injector,
    active: !!editingCell?.active,
    focusPending: null,
    focusTarget: null,
    getState,
    update(editingCell) {
      readOnly.set(getReadOnly(editingCell));
      session.active = !!editingCell?.active;
    },
  };
  (session as { injector: Injector }).injector = Injector.create({
    providers: [{ provide: INFINITE_COLUMN_EDITOR, useValue: session }],
    parent: parentInjector,
  });

  return session;
}

const FOCUSABLE_SELECTOR = [
  'input:not([disabled]):not([type="hidden"])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  'button:not([disabled])',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Focuses the editor of a template editor once its view exists: the element
 * marked with `infiniteEditorInput`, else the first focusable element of the
 * cell outside the content div.
 */
export function focusTemplateEditor(
  session: ColumnEditorSession<any>,
  cellElement: HTMLElement,
  contentClassName: string,
) {
  if (session.focusPending !== true) {
    return;
  }
  session.focusPending = false;

  const activeElement = cellElement.ownerDocument.activeElement;
  if (
    activeElement &&
    activeElement !== cellElement &&
    cellElement.contains(activeElement)
  ) {
    // the template focused itself
    return;
  }

  let target = session.focusTarget;
  if (!target || !cellElement.contains(target)) {
    target = null;
    const candidates =
      cellElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      if (!candidate.closest(`.${contentClassName}`)) {
        target = candidate;
        break;
      }
    }
  }
  target?.focus();
}

/**
 * Marks the element a template editor wants focused when editing starts
 * (otherwise the first focusable element of the editor is focused):
 *
 * ```html
 * <ng-template #editor let-editor>
 *   <input infiniteEditorInput [value]="editor.initialValue" (input)="editor.setValue($any($event.target).value)" (keydown.enter)="editor.confirmEdit()" />
 * </ng-template>
 * ```
 */
@Directive({
  selector: '[infiniteEditorInput]',
})
export class InfiniteEditorInput {
  constructor() {
    const session = inject(INFINITE_COLUMN_EDITOR, { optional: true });
    if (session) {
      const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
      session.focusTarget = element;
      inject(DestroyRef).onDestroy(() => {
        if (session.focusTarget === element) {
          session.focusTarget = null;
        }
      });
    }
  }
}

const EDITOR_CLASS_NAME = join(absoluteCover, outline.none);

/**
 * The default cell editor - a text input covering the cell (same class
 * names as React and Vue), focused when editing starts; Enter/Tab confirm,
 * Escape cancels, blur confirms unless the edit was cancelled.
 */
@Component({
  selector: 'input[infiniteColumnEditor]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    type: 'text',
    '[class]': 'className',
    '[readOnly]': 'editor.readOnly()',
  },
  template: '',
})
export class InfiniteTableColumnEditor implements AfterViewInit {
  protected readonly editor = injectColumnEditor();
  protected readonly className = EDITOR_CLASS_NAME;

  private readonly element =
    inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

  constructor() {
    const el = this.element;
    const { initialValue, setValue, confirmEdit, cancelEdit } = this.editor;
    const { getState } = inject(INFINITE_COLUMN_EDITOR);

    // uncontrolled input, like React's defaultValue: set once
    el.value = initialValue ?? '';

    // Track if edit was cancelled via Escape to prevent blur from confirming
    let cancelled = false;

    const onKeyDown = (event: KeyboardEvent) => {
      const { key } = event;
      if (key === 'Enter' || key === 'Tab') {
        confirmEdit();
        // as in Vue (and unlike React, where dispatch is async): the state
        // update is synchronous, so letting this event reach the grid
        // handler would immediately start a NEW edit on the active cell
        event.stopPropagation();
        if (key === 'Tab') {
          // the grid handler normally does this while an edit is in progress
          event.preventDefault();
        }
      } else if (key === 'Escape') {
        cancelled = true;
        cancelEdit();
      } else {
        event.stopPropagation();
      }
    };

    const onBlur = () => {
      // confirm on blur only while the edit is still active - when it was
      // already confirmed (Enter) or cancelled (Escape), the input can blur
      // as part of the teardown and must not restart the confirm cycle
      if (!cancelled && getState().editingCell?.active) {
        confirmEdit();
      }
    };

    const onInput = () => {
      setValue(el.value);
    };

    el.addEventListener('keydown', onKeyDown);
    el.addEventListener('blur', onBlur);
    el.addEventListener('input', onInput);

    inject(DestroyRef).onDestroy(() => {
      el.removeEventListener('keydown', onKeyDown);
      el.removeEventListener('blur', onBlur);
      el.removeEventListener('input', onInput);
    });
  }

  ngAfterViewInit() {
    // React focuses in the ref callback (on mount)
    this.element.focus();
  }
}

/**
 * What the root passes to the body cells as `renderEditor`: the column's
 * `components.Editor` (a component class, or a template whose context is the
 * editor object) or the default editor, rendered with the session injector
 * (which provides `injectColumnEditor()`).
 */
export function renderColumnEditor<T>(
  renderParam: InfiniteTableColumnCellContextType<T>,
  session: ColumnEditorSession<T>,
): Renderable {
  const Editor = (renderParam.column as { components?: { Editor?: unknown } })
    .components?.Editor as Type<unknown> | TemplateRef<any> | undefined;

  if (Editor instanceof TemplateRef) {
    // once per edit
    if (session.focusPending === null) {
      session.focusPending = true;
    }
    const context = session.context;
    return renderTemplate(
      Editor,
      { ...context, $implicit: context },
      session.injector,
    );
  }

  return renderComponent(Editor ?? InfiniteTableColumnEditor, {
    injector: session.injector,
  });
}

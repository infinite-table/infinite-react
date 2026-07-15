import { defineComponent, h } from 'vue';

import { join } from '../../../../utils/join';
import { absoluteCover, outline } from '../../utilities.css';

import { useInfiniteTableContext } from '../../InfiniteTableContextForVue.vue';
import { useInfiniteColumnCell } from './InfiniteTableColumnCellForVue.vue';

import type { InfiniteColumnEditorContextType } from '../../types/InfiniteTableProps';

/**
 * Vue sibling of useInfiniteColumnEditor (InfiniteTableColumnCell.tsx):
 * exposes the editing contract (initialValue, setValue, confirm/cancel/reject)
 * to editor components. Must be called from a component rendered inside a
 * cell that is in edit mode.
 */
export function useInfiniteColumnEditor<
  T = any,
>(): InfiniteColumnEditorContextType<T> {
  const { api, getState } = useInfiniteTableContext<T>();
  const cellContextRef = useInfiniteColumnCell<T>();

  const { editingCell, editingValueRef } = getState();

  // captured once, when editing starts (the editor is remounted per edit) -
  // same as React's useState initializer
  const initialValue = editingCell?.value;
  let currentValue = initialValue;

  editingValueRef.current = initialValue;

  const setValue = (value: any) => {
    editingValueRef.current = value;
    currentValue = value;
  };

  const { column, rowInfo } = cellContextRef.value;

  return {
    api,
    initialValue,
    get value() {
      return currentValue;
    },
    get readOnly() {
      const { editingCell } = getState();
      return editingCell ? !editingCell.active && !!editingCell.waiting : false;
    },
    column,
    rowInfo,
    setValue,
    confirmEdit: api.confirmEdit,
    cancelEdit: api.cancelEdit,
    rejectEdit: api.rejectEdit,
  };
}

/**
 * Vue sibling of InfiniteTableColumnEditor: the default cell editor - a text
 * input covering the cell (same classnames), focused on mount; Enter/Tab
 * confirm, Escape cancels, blur confirms unless the edit was cancelled.
 */
export const InfiniteTableColumnEditor = defineComponent({
  name: 'InfiniteTableColumnEditor',
  setup() {
    const { state } = useInfiniteTableContext();
    const editorContext = useInfiniteColumnEditor();
    const { initialValue, setValue, confirmEdit, cancelEdit } = editorContext;

    // Track if edit was cancelled via Escape to prevent blur from confirming
    let cancelled = false;

    let mounted = false;
    const refCallback = (node: any) => {
      if (node && !mounted) {
        mounted = true;
        // uncontrolled input, like React's defaultValue: set the value once
        // on mount and never patch it on re-renders (re-renders happen when
        // editingCell changes, e.g. to flip readonly while persisting)
        (node as HTMLInputElement).value = initialValue ?? '';
        (node as HTMLInputElement).focus();
      }
    };

    const onKeydown = (event: KeyboardEvent) => {
      const { key } = event;
      if (key === 'Enter' || key === 'Tab') {
        confirmEdit();
        // unlike React (where dispatch is async, so the grid keydown handler
        // still sees the edit as in progress when the event bubbles up), Vue
        // state updates are synchronous - letting this event reach the grid
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
      // confirm on blur only while the edit is still active - when the edit
      // was already confirmed (Enter) or cancelled (Escape), the input blurs
      // as part of teardown and must not restart the confirm cycle (unlike
      // React, Vue's teardown can fire the native blur listener)
      if (!cancelled && state.value.editingCell?.active) {
        confirmEdit();
      }
    };

    const onInput = (event: Event) => {
      setValue((event.target as HTMLInputElement).value);
    };

    return () => {
      // track the state ref so the render re-runs when editingCell changes
      // (readOnly is true only while a lazy editable check is pending)
      void state.value.editingCell;
      return h('input', {
        readonly: editorContext.readOnly || undefined,
        ref: refCallback,
        onKeydown,
        onBlur,
        onInput,
        class: join(absoluteCover, outline.none),
        type: 'text',
      });
    };
  },
});

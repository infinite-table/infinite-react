import { InfiniteTablePropKeyboardShorcut } from '../types';

export const instantEdit: InfiniteTablePropKeyboardShorcut = {
  key: '*',
  when: (context) => {
    const { activeCellIndex } = context.getState();
    if (activeCellIndex) {
      const [rowIndex, colIndex] = activeCellIndex;
      const column = context.api.getColumnAtIndex(colIndex);

      if (!column) {
        return false;
      }
      return context.api.isCellEditable({
        rowIndex,
        columnId: column.id,
      });
    }
    return false;
  },

  handler: (context, event) => {
    const { key } = event;

    if (key != 'Escape' && key.length === 1) {
      const { activeCellIndex } = context.getState();
      if (activeCellIndex) {
        const [rowIndex, colIndex] = activeCellIndex;
        const column = context.api.getColumnAtIndex(colIndex);
        if (!column) {
          return;
        }

        // we want to start the edit in a timeout
        // since if we don't, the pressed key will be added to the input
        // but since we call `startEdit` with an initialValue, that should be used
        //
        // doing the setTimeout also covers the case when the edit starts asynchrounously
        // and we correctly start it with the correct value
        requestAnimationFrame(() => {
          context.api.startEdit({
            rowIndex,
            // value: '',
            value: key,
            columnId: column.id,
          });
        });
      }
    }
  },
};

export const keyboardShortcuts = {
  instantEdit,
};

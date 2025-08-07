import * as React from 'react';
import { DragManager } from './DragManager';
import { useEffect } from 'react';

export type DragDropSourceAndTarget = {
  dragSourceListId: string | null;
  dropTargetListId: string | null;
  dragItemId: string;
};

type DragDropProviderContextValue = DragDropSourceAndTarget & {
  updateDragOperationSourceAndTarget: (params: DragDropSourceAndTarget) => void;
};

const DragDropProviderContext =
  React.createContext<DragDropProviderContextValue>({
    dragSourceListId: null,
    dropTargetListId: null,
    dragItemId: '',
    updateDragOperationSourceAndTarget: (
      _params: DragDropSourceAndTarget,
    ) => {},
  });

export const useDragDropProvider = () => {
  return React.useContext(DragDropProviderContext);
};

export const DragDropProvider = (props: {
  children:
    | React.ReactNode
    | ((context: DragDropProviderContextValue) => React.ReactNode);
}) => {
  const [state, setState] = React.useState<DragDropSourceAndTarget>({
    dragSourceListId: null,
    dropTargetListId: null,
    dragItemId: '',
  });

  const stateRef = React.useRef(state);
  stateRef.current = state;

  const contextValue = React.useMemo(
    () => ({
      dragSourceListId: state.dragSourceListId,
      dropTargetListId: state.dropTargetListId,
      dragItemId: state.dragItemId,
      updateDragOperationSourceAndTarget: setState,
    }),
    [state, setState],
  );

  useEffect(() => {
    const removeDragStart = DragManager.on('drag-start', (params) => {
      setState({
        dragSourceListId: params.dragSourceListId,
        dropTargetListId: params.dropTargetListId,
        dragItemId: params.dragItem.id,
      });
    });

    const removeDragMove = DragManager.on('drag-move', (params) => {
      const currentState = stateRef.current;

      const newState: DragDropSourceAndTarget = {
        dragSourceListId: params.dragSourceListId,
        dropTargetListId: params.dropTargetListId,
        dragItemId: params.dragItem.id,
      };

      if (JSON.stringify(currentState) === JSON.stringify(newState)) {
        return;
      }

      setState(newState);
    });

    const removeDragDrop = DragManager.on('drag-drop', () => {
      setState({
        dragSourceListId: null,
        dropTargetListId: null,
        dragItemId: '',
      });
    });

    return () => {
      removeDragStart();
      removeDragMove();
      removeDragDrop();
    };
  }, [DragManager, setState]);

  return (
    <DragDropProviderContext.Provider value={contextValue}>
      {typeof props.children === 'function'
        ? props.children(contextValue)
        : props.children}
    </DragDropProviderContext.Provider>
  );
};

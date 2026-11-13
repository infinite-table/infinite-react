import * as React from 'react';
import { DragManager } from './DragManager';
import { useEffect } from 'react';

export type DragDropSourceAndTarget = {
  dragSourceListId: string | null;
  dropTargetListId: string | null;
  dragItemId: string;
  status: 'accepted' | 'rejected';
};

type DragDropProviderContextValue = DragDropSourceAndTarget & {
  updateDragOperationSourceAndTarget: (params: DragDropSourceAndTarget) => void;
  getCurrentDragSourceAndTarget: () => DragDropSourceAndTarget;
};

const DragDropProviderContext =
  React.createContext<DragDropProviderContextValue>({
    dragSourceListId: null,
    dropTargetListId: null,
    dragItemId: '',
    status: 'accepted',
    updateDragOperationSourceAndTarget: (
      _params: DragDropSourceAndTarget,
    ) => {},
    getCurrentDragSourceAndTarget: () => ({
      dragSourceListId: null,
      dropTargetListId: null,
      status: 'accepted',
      dragItemId: '',
    }),
  });

export const useDragDropProvider = () => {
  return React.useContext(DragDropProviderContext);
};

/**
 * Unique for each provider. Empty when there is no provider.
 */
const DragDropProviderIdContext = React.createContext('');

/**
 * Drag lists are registered globally by their id, so two lists on a page
 * can't have the same id. Every grid has its own provider, so this gives
 * a list of a grid (eg: its header) an id no other grid uses.
 */
export const useDragListId = (name: string) => {
  const providerId = React.useContext(DragDropProviderIdContext);

  return providerId ? `${name}-${providerId}` : name;
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
    status: 'accepted',
  });

  const providerId = React.useId();

  const stateRef = React.useRef(state);
  stateRef.current = state;

  const getCurrentDragSourceAndTarget = React.useCallback(() => {
    const currentState = stateRef.current;
    return {
      dragSourceListId: currentState.dragSourceListId,
      dropTargetListId: currentState.dropTargetListId,
      dragItemId: currentState.dragItemId,
      status: currentState.status,
    };
  }, []);

  const contextValue = React.useMemo(() => {
    return {
      dragSourceListId: state.dragSourceListId,
      dropTargetListId: state.dropTargetListId,
      dragItemId: state.dragItemId,
      status: state.status,
      updateDragOperationSourceAndTarget: setState,
      getCurrentDragSourceAndTarget,
    };
  }, [state, setState]);

  useEffect(() => {
    const removeDragStart = DragManager.on('drag-start', (params) => {
      setState({
        dragSourceListId: params.dragSourceListId,
        dropTargetListId: params.dropTargetListId,
        dragItemId: params.dragItem.id,
        status: 'accepted',
      });
    });

    const removeDragMove = DragManager.on('drag-move', (params) => {
      const currentState = stateRef.current;

      const newState: DragDropSourceAndTarget = {
        dragSourceListId: params.dragSourceListId,
        dropTargetListId: params.dropTargetListId,
        dragItemId: params.dragItem.id,
        status: params.status,
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
        status: 'accepted',
      });
    });

    return () => {
      removeDragStart();
      removeDragMove();
      removeDragDrop();
    };
  }, [DragManager, setState]);

  return (
    <DragDropProviderIdContext.Provider value={providerId}>
      <DragDropProviderContext.Provider value={contextValue}>
        {typeof props.children === 'function'
          ? props.children(contextValue)
          : props.children}
      </DragDropProviderContext.Provider>
    </DragDropProviderIdContext.Provider>
  );
};

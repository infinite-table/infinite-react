import * as React from 'react';

export type DragDropSourceAndTarget = {
  dragSourceListId: string | null;
  dropTargetListId: string | null;
};

type DragDropProviderContextValue = DragDropSourceAndTarget & {
  updateDragOperationSourceAndTarget: (params: DragDropSourceAndTarget) => void;
};

const DragDropProviderContext =
  React.createContext<DragDropProviderContextValue>({
    dragSourceListId: null,
    dropTargetListId: null,
    updateDragOperationSourceAndTarget: (
      _params: DragDropSourceAndTarget,
    ) => {},
  });

export const useDragDropProvider = () => {
  return React.useContext(DragDropProviderContext);
};

export const DragDropProvider = (props: { children: React.ReactNode }) => {
  const [state, setState] = React.useState<DragDropSourceAndTarget>({
    dragSourceListId: null,
    dropTargetListId: null,
  });

  const contextValue = React.useMemo(
    () => ({
      dragSourceListId: state.dragSourceListId,
      dropTargetListId: state.dropTargetListId,
      updateDragOperationSourceAndTarget: setState,
    }),
    [state, setState],
  );

  return (
    <DragDropProviderContext.Provider value={contextValue}>
      {props.children}
    </DragDropProviderContext.Provider>
  );
};

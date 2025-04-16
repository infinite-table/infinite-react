import { useAPIManagerContext } from '../lib/APIManagerContext';
import { useDevToolsMessagingContext } from '../lib/DevToolsMessagingContext';
import { ConnectStatus } from './ConnectStatus';
import { HighlightButton } from './HighlightButton';
import { RevertButton } from './RevertButton';
import { SidebarTrigger } from './ui/sidebar';

export function InstanceTitle() {
  const { currentInstance } = useDevToolsMessagingContext();
  const { overridenProperties, revertAll } = useAPIManagerContext();

  if (!currentInstance) {
    return null;
  }

  return (
    <>
      <div className="bg-sidebar text-sidebar-foreground text-base  flex flex-col">
        <div className="flex justify-between p-2">
          <div className="flex items-center gap-2">
            <SidebarTrigger /> Instance "{currentInstance.debugId}"{' '}
            <ConnectStatus />
          </div>
          <div className="flex items-center gap-2">
            {overridenProperties.size !== 0 ? (
              <RevertButton
                absolute={false}
                onClick={() => {
                  revertAll();
                }}
              />
            ) : null}

            <HighlightButton debugId={currentInstance.debugId}>
              <span className="text-xs">Highlight</span>
            </HighlightButton>
          </div>
        </div>
        <hr className="border-border" />
      </div>
    </>
  );
}

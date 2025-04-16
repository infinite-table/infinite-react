import { useDevToolsMessagingContext } from '../../lib/DevToolsMessagingContext';
import { DevToolsSidebarSection } from '../DevToolsSidebarSection';

export function DebugTimingsSection() {
  const currentInstance = useDevToolsMessagingContext().currentInstance!;
  return (
    <DevToolsSidebarSection name="Debug Timings">
      <ul className="flex flex-col gap-2 font-light">
        <li>Last sort: {currentInstance.debugTimings.sort || 0}ms</li>
        <li>Last filter: {currentInstance.debugTimings.filter || 0}ms</li>
        <li>
          Last group/pivot:{' '}
          {currentInstance.debugTimings['group-and-pivot'] || 0}ms
        </li>
        <li>Last tree: {currentInstance.debugTimings.tree || 0}ms</li>
      </ul>
    </DevToolsSidebarSection>
  );
}

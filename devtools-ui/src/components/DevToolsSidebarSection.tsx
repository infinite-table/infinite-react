type DevToolsSidebarSectionProps = {
  name: string;
  children: React.ReactNode;
};
export function DevToolsSidebarSection(props: DevToolsSidebarSectionProps) {
  return (
    <div className="text-sm bg-muted text-muted-foreground p-4 rounded-md flex flex-col gap-2">
      <span className="font-medium text-foreground">{props.name}</span>

      {props.children}
    </div>
  );
}

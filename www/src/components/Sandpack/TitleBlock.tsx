import { IconCodeBlock } from "../icons/IconCodeBlock";

export function TitleBlock({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`leading-base bg-gray-800 ${className || ""} w-full `}>
      <div className="text-textcolorpale flex items-center text-sm px-2 lg:px-4 py-2 relative">
        <IconCodeBlock className="inline-flex mr-2 self-center" /> {children}
      </div>
    </div>
  );
}

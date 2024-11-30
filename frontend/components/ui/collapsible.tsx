import { useState } from "react";
import { LucideChevronDown, LucideChevronRight } from "lucide-react";
import React from "react";

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean;
  disabled?: boolean;
}

export function Collapsible({
  children,
  defaultOpen = false,
  disabled,
  className,
  ...props
}: CollapsibleProps) {
  if (!children) throw new Error("Collapsible must have children");

  const [isCollapsed, setIsCollapsed] = useState(defaultOpen);

  const content = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === CollapsibleContent,
  ) as React.ReactElement<CollapsibleContentProps> | undefined;

  const header = React.Children.toArray(children).filter(
    (child) =>
      !React.isValidElement(child) || child.type !== CollapsibleContent,
  );

  if (!content) throw new Error("Collapsible must have content");

  return (
    <div className={`${className}`} {...props}>
      <button
        className="flex w-full items-center"
        onClick={() => setIsCollapsed(!isCollapsed)}
        disabled={disabled}
      >
        {!isCollapsed ? <LucideChevronRight /> : <LucideChevronDown />}
        <div className="w-full">{header}</div>
      </button>
      {isCollapsed && content}
    </div>
  );
}

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CollapsibleContent(props: CollapsibleContentProps) {
  return <div {...props} />;
}

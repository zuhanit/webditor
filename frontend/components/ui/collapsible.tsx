"use client";

import { useContext, createContext, useState } from "react";
import { Slot } from "./slot";
import { twMerge } from "tailwind-merge";

interface CollapsibleContextProps {
  open: boolean;
  toggle: () => void;
  disabled?: boolean;
}

const CollapsibleContext = createContext<CollapsibleContextProps | null>(null);

export function useCollapsible() {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error("useCollapsible must be used within a Collapsible.");
  }

  return context;
}

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
  const [open, setOpen] = useState(defaultOpen);
  const toggle = () => {
    if (!disabled) setOpen((prev) => !prev);
  };

  return (
    <CollapsibleContext.Provider
      value={{
        open,
        toggle,
        disabled,
      }}
    >
      <div
        className={twMerge("w-full", className)}
        data-state={open ? "open" : "closed"}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

interface CollapsibleTriggerProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

export function CollapsibleTrigger({
  asChild = false,
  children,
  ...props
}: CollapsibleTriggerProps) {
  const { toggle, disabled } = useCollapsible();

  const Component = asChild ? Slot : "button";
  return (
    <Component onClick={toggle} disabled={disabled} {...props}>
      {children}
    </Component>
  );
}

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CollapsibleContent({
  className,
  children,
  ...props
}: CollapsibleContentProps) {
  const { open } = useCollapsible();
  if (!open) return null;

  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

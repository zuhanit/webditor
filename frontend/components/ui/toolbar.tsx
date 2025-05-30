"use client";

import { createContext, useContext, useState } from "react";
import { twMerge } from "tailwind-merge";

interface ToolbarContextProps {
  active: string[];
  setActive: (toolID: string) => void;
}

const ToolbarContext = createContext<ToolbarContextProps | null>(null);

export function useToolbar() {
  const context = useContext(ToolbarContext);
  if (!context) {
    throw new Error("useToolbar must be used within a ToolbarProvider.");
  }

  return context;
}

export function ToolbarProvider({ children }: { children: React.ReactNode }) {
  const [activeTool, setActiveTool] = useState<string[]>([]);
  const setActive = (toolID: string) => {
    setActiveTool((prev) => {
      if (prev.includes(toolID)) {
        return prev.filter((id) => id !== toolID);
      }
      return [...prev, toolID];
    });
  };

  return (
    <ToolbarContext.Provider value={{ active: activeTool, setActive }}>
      {children}
    </ToolbarContext.Provider>
  );
}

export function Toolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <ToolbarProvider>
      <div
        className={twMerge(
          "flex w-full items-center justify-center gap-2",
          className,
        )}
        {...props}
      />
    </ToolbarProvider>
  );
}

export function ToolbarToggleItem({
  className,
  children,
  value,
  ...props
}: React.ComponentProps<"button"> & { value: string }) {
  const { active: activeTool, setActive } = useToolbar();

  return (
    <button
      data-active={activeTool.includes(value)}
      className={twMerge(
        "rounded-md px-3 py-1",
        "data-[active=true]:text-white data-[active=true]:bg-surface-primary",
        className,
      )}
      onClick={() => setActive(value)}
      {...props}
    >
      {children}
    </button>
  );
}

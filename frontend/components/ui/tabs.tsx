"use client";

import { createContext, useContext, useState } from "react";
import { twMerge } from "tailwind-merge";

interface TabsContextProps {
  openTab: string;
  open: (id: string) => void;
}

const TabsContext = createContext<TabsContextProps | null>(null);

export function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used withn a TabsProvider.");
  }

  return context;
}

export function Tabs({
  defaultValue,
  ...props
}: React.ComponentProps<"div"> & {
  defaultValue: string;
}) {
  const [openTab, setOpenTab] = useState(defaultValue);
  const open = (id: string) => setOpenTab(id);

  return (
    <TabsContext.Provider value={{ openTab, open }}>
      <div {...props} />
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul className={twMerge("flex gap-2 px-1.5 py-2", className)} {...props} />
  );
}

export function TabsTrigger({
  value,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  value: string;
}) {
  const { openTab, open } = useTabs();

  return (
    <li>
      <button
        className={twMerge(
          "rounded-md bg-surface-secondary px-2 py-1",
          openTab === value && "bg-surface-primary",
          className,
        )}
        role="tab"
        {...props}
        onClick={() => open(value)}
      />
    </li>
  );
}

export function TabsContent({
  value,
  ...props
}: React.ComponentProps<"div"> & {
  value: string;
}) {
  const { openTab } = useTabs();

  if (openTab !== value) {
    return null;
  }

  return (
    <div
      data-state={openTab === value ? "active" : "inactive"}
      role="tabpanel"
      {...props}
    />
  );
}

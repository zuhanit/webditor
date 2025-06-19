"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { Slot } from "./slot";
import { Input } from "./input";
import { PanelLeftIcon } from "lucide-react";
import { Button } from "./button";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";

interface SidebarContextProps {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextProps | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used withn a SidebarProvider.");
  }

  return context;
}

interface SidebarProviderProps extends React.ComponentProps<"div"> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  children,
  ...props
}: SidebarProviderProps) {
  const [_open, _setOpen] = useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  const toggleSidebar = useCallback(() => {
    return setOpen((open) => !open);
  }, [setOpen]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      toggleSidebar,
    }),
    [state, open, setOpen, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
          } as React.CSSProperties
        }
        className={twMerge("h-full", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  collapsible = "offcanvas",
  side = "left",
  variant = "sidebar",
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  collapsible?: "offcanvas" | "icon" | "none";
  variant?: "floating" | "sidebar";
}) {
  const { state } = useSidebar();

  return (
    <div
      className="group hidden h-full transition-[width] duration-200 ease-linear md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-side={side}
      data-variant={variant}
    >
      <div
        data-slot="sidebar-gap"
        className={twMerge(
          "relative w-[var(--sidebar-width)]",
          "group-data-[collapsible=offcanvas]:w-0",
        )}
      ></div>
      <div
        data-slot="sidebar-container"
        className={twMerge(
          className,
          "transition-[left, right, width] hidden h-full w-[var(--sidebar-width)] flex-col overflow-auto duration-200 ease-linear md:flex",
          "group-data-[collapsible=offcanvas]:w-0",
          variant === "floating"
            ? "shadow-md"
            : "group-data-[side=left]:border-r group-data-[side=right]:border-l",
        )}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="flex h-full flex-col bg-background-secondary group-data-[variant=floating]:rounded-md"
          {...props}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function SidebarTrigger({
  onClick,
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      className={className}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

export function SidebarInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      className={twMerge(
        "h-8 w-full border-none bg-surface-secondary",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="header"
      className={twMerge("flex w-full flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

export function SidebarFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="footer"
      className={twMerge("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

export function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<"hr">) {
  return (
    <hr
      className={twMerge(
        "-mx-1.5 h-px w-full border-0 bg-text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="content"
      className={twMerge(
        "flex w-full min-w-0 flex-1 flex-col gap-2 overflow-auto p-2",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="group"
      className={twMerge(
        "relative flex w-full min-w-0 flex-1 flex-col gap-2 p-2",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroupLabel({
  className,
  asChild,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Component = asChild ? Slot : "div";
  return (
    <Component
      data-sidebar="group-label"
      className={`flex h-8 items-center rounded-md px-2 font-medium ${className}`}
      {...props}
    />
  );
}

export function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="group-content"
      className={twMerge("w-full text-sm", className)}
      {...props}
    />
  );
}

export function SidebarMenu({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-sidebar="menu"
      className={twMerge("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    ></ul>
  );
}

export function SidebarMenuItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-sidebar="menu-item"
      className={twMerge("group/menu-item relative w-full", className)}
      {...props}
    ></li>
  );
}

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
}) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      data-sidebar="menu-button"
      data-active={isActive}
      className={twMerge(
        "flex h-8 w-full items-center gap-2 overflow-hidden rounded-md px-2 transition-all hover:bg-background-primary",
        "data-[active=true]:bg-surface-primary data-[active=true]:font-bold data-[active=true]:text-blue data-[active=true]:shadow-md",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarMenuSub({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-sidebar="menu-sub"
      className={twMerge(
        "mx-3.5 flex w-full min-w-0 translate-x-px flex-col gap-1 border-l border-text-muted px-2.5 py-0.5",
        className,
      )}
      {...props}
    ></ul>
  );
}

export function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-sidebar="menu-sub-item"
      className={twMerge("flex w-full gap-2", className)}
      {...props}
    ></li>
  );
}

export function SidebarMenuSubButton({
  asChild = false,
  isActive = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
}) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      data-sidebar="menu-sub-button"
      data-active={isActive}
      className={twMerge(
        "flex h-8 w-full rounded-md transition-all hover:bg-background-primary",
        "data-[active=true]:bg-surface-primary data-[active=true]:font-bold data-[active=true]:text-blue data-[active=true]:shadow-md",
      )}
      {...props}
    />
  );
}

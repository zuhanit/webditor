"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "./button";

interface MenubarContextProps {
  openMenu: string;
  toggle: (menuID: string) => void;
}

const MenubarContext = createContext<MenubarContextProps | null>(null);

export function useMenubar() {
  const context = useContext(MenubarContext);
  if (!context) {
    throw new Error("useMenubar must be used withn a MenubarProvider.");
  }

  return context;
}

export function MenubarProvider({ children }: { children: React.ReactNode }) {
  const [openMenu, setOpenMenu] = useState("");
  const toggle = (menuID: string) => {
    if (openMenu === menuID) {
      setOpenMenu("");
    } else {
      setOpenMenu(menuID);
    }
  };

  return (
    <MenubarContext.Provider value={{ openMenu, toggle }}>
      {children}
    </MenubarContext.Provider>
  );
}

export function Menubar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <MenubarProvider>
      <div className={twMerge("flex gap-2", className)} {...props} />
    </MenubarProvider>
  );
}

interface MenubarMenuContextProps {
  open: boolean;
  id: string;
}

const MenubarMenuContext = createContext<MenubarMenuContextProps | null>(null);

export function useMenubarMenu() {
  const context = useContext(MenubarMenuContext);
  if (!context) {
    throw new Error("useMenubarMenu must be used withn a MenubarMenuProvider.");
  }

  return context;
}

export function MenubarMenu({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  const { openMenu } = useMenubar();
  const id = useId();

  const menubarRef = useRef<HTMLUListElement>(null);
  const { toggle } = useMenubar();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menubarRef.current &&
        !menubarRef.current.contains(event.target as Node)
      ) {
        toggle("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [toggle]);

  return (
    <MenubarMenuContext.Provider value={{ open: openMenu === id, id }}>
      <ul
        ref={menubarRef}
        className={twMerge("group relative flex", className)}
        data-state={openMenu === id ? "open" : "closed"}
        {...props}
      />
    </MenubarMenuContext.Provider>
  );
}

export function MenubarTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { toggle, openMenu } = useMenubar();
  const { id } = useMenubarMenu();

  const handleMouseEnter = () => {
    if (openMenu) {
      toggle(id);
    }
  };

  return (
    <li
      role="listitem"
      className={twMerge(
        "group-data-[state=open]:bg-background-primary",
        className,
      )}
    >
      <button
        className="rounded-md px-3 py-1"
        onClick={() => toggle(id)}
        onMouseEnter={handleMouseEnter}
        {...props}
      >
        {children}
      </button>
    </li>
  );
}

export function MenubarContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      className={twMerge(
        "flex flex-col gap-1",
        "absolute left-0 top-full z-50 mt-1 min-w-full rounded-md bg-background-primary p-2 shadow-lg",
        "group-data-[state=closed]:hidden",
        className,
      )}
      {...props}
    />
  );
}

export function MenubarItem({
  disabled = false,
  className,
  ...props
}: React.ComponentProps<"button"> & { disabled?: boolean }) {
  if (disabled) {
    return (
      <li
        className={twMerge(
          "whitespace-nowrap text-sm text-text-muted",
          className,
        )}
      >
        <span {...props}>{props.children}</span>
      </li>
    );
  }
  return (
    <li className={twMerge("w-full whitespace-nowrap text-sm", className)}>
      <Button {...props}></Button>
    </li>
  );
}

export function MenubarSeparator() {
  return <hr className="-mx-1.5 h-px border-0 bg-text-muted" />;
}

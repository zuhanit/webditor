"use client";

import { twMerge } from "tailwind-merge";
import { createContext, useContext, useState, useRef, useEffect } from "react";

interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLElement>;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

export function DropdownMenu({
  children,
  onOpenChange,
}: {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        handleOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  return (
    <DropdownContext.Provider
      value={{ isOpen, setIsOpen: handleOpenChange, triggerRef, contentRef }}
    >
      <div className="relative inline-block text-left">{children}</div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  className,
  asChild = false,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
} & React.ComponentProps<"button">) {
  const context = useContext(DropdownContext);

  if (!context) {
    throw new Error("DropdownMenuTrigger must be used within DropdownMenu");
  }

  const { isOpen, setIsOpen, triggerRef } = context;

  if (asChild) {
    return (
      <div
        ref={triggerRef as React.RefObject<HTMLDivElement>}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {children}
      </div>
    );
  }

  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      onClick={() => setIsOpen(!isOpen)}
      className={twMerge(
        "hover:text-text focus:text-text inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-primary focus:bg-surface-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  children,
  className,
  align = "end",
  sideOffset = 4,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
} & React.ComponentProps<"div">) {
  const context = useContext(DropdownContext);
  const contentRef = useRef<HTMLDivElement>(null);
  const [adjustedAlign, setAdjustedAlign] = useState(align);

  if (!context) {
    throw new Error("DropdownMenuContent must be used within DropdownMenu");
  }

  const { isOpen, triggerRef, contentRef: contextContentRef } = context;

  // 화면 경계 확인 및 위치 조정
  useEffect(() => {
    if (!isOpen || !contentRef.current || !triggerRef.current) return;

    const trigger = triggerRef.current;
    const triggerRect = trigger.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let newAlign = align;

    // 좌우 경계 체크
    if (align === "end") {
      // 우측 정렬인데 좌측 공간이 부족한 경우
      if (triggerRect.left < 200) { // 최소 200px 공간 필요
        newAlign = "start";
      }
    } else if (align === "start") {
      // 좌측 정렬인데 우측 공간이 부족한 경우
      if (triggerRect.right + 200 > viewport.width) { // 최소 200px 공간 필요
        newAlign = "end";
      }
    }

    setAdjustedAlign(newAlign);
  }, [isOpen, align]);

  if (!isOpen) return null;

  const alignmentClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  return (
    <div
      ref={(el) => {
        if (contentRef) contentRef.current = el;
        if (contextContentRef) (contextContentRef as any).current = el;
      }}
      className={twMerge(
        "text-text absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-overlay-primary bg-background-primary p-1 shadow-lg",
        alignmentClasses[adjustedAlign],
        className,
      )}
      style={{ top: `calc(100% + ${sideOffset}px)` }}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  className,
  onClick,
  disabled = false,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
} & React.ComponentProps<"div">) {
  const context = useContext(DropdownContext);

  if (!context) {
    throw new Error("DropdownMenuItem must be used within DropdownMenu");
  }

  const { setIsOpen } = context;

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    setIsOpen(false);
  };

  return (
    <div
      onClick={handleClick}
      className={twMerge(
        "hover:text-text focus:text-text relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-surface-primary focus:bg-surface-primary",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={twMerge("-mx-1 my-1 h-px bg-overlay-primary", className)}
      {...props}
    />
  );
}

export function DropdownMenuLabel({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<"div">) {
  return (
    <div
      className={twMerge(
        "text-subtext1 px-2 py-1.5 text-sm font-semibold",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

"use client";

import { twMerge } from "tailwind-merge";
import { Slot } from "./slot";
import { createContext, useContext, useState } from "react";

interface AvatarContextType {
  imageLoaded: boolean;
  imageError: boolean;
  setImageLoaded: (loaded: boolean) => void;
  setImageError: (error: boolean) => void;
}

const AvatarContext = createContext<AvatarContextType | null>(null);

export function Avatar({
  className,
  asChild,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const Component = asChild ? Slot : "div";

  return (
    <AvatarContext.Provider
      value={{ imageLoaded, imageError, setImageLoaded, setImageError }}
    >
      <Component
        className={twMerge(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
          className,
        )}
        {...props}
      />
    </AvatarContext.Provider>
  );
}

export function AvatarImage({
  asChild,
  className,
  onLoad,
  onError,
  ...props
}: React.ComponentProps<"img"> & { asChild?: boolean }) {
  const context = useContext(AvatarContext);
  const Component = asChild ? Slot : "img";

  if (!context) {
    throw new Error("AvatarImage must be used within Avatar");
  }

  const { setImageLoaded, setImageError } = context;

  return (
    <Component
      className={twMerge("aspect-square h-full w-full object-cover", className)}
      onLoad={(e) => {
        setImageLoaded(true);
        setImageError(false);
        onLoad?.(e);
      }}
      onError={(e) => {
        setImageLoaded(false);
        setImageError(true);
        onError?.(e);
      }}
      {...props}
    />
  );
}

export function AvatarFallback({
  asChild,
  className,
  ...props
}: React.ComponentProps<"span"> & { asChild?: boolean }) {
  const context = useContext(AvatarContext);
  const Component = asChild ? Slot : "span";

  if (!context) {
    throw new Error("AvatarFallback must be used within Avatar");
  }

  const { imageLoaded, imageError } = context;

  console.log(context);
  // 이미지가 로드되지 않았거나 에러가 발생한 경우에만 표시
  if (imageLoaded && !imageError) {
    return null;
  }

  return (
    <Component
      className={twMerge(
        "bg-muted flex h-full w-full items-center justify-center rounded-full text-sm font-medium",
        className,
      )}
      {...props}
    />
  );
}

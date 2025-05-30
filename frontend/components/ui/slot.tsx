import * as React from "react";

export const Slot = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ children, ...props }, ref) => {
  if (!React.isValidElement(children)) return null;

  return React.cloneElement(children, {
    ...props,
    ref,
    ...children.props,
  });
});
Slot.displayName = "Slot";

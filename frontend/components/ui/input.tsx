import { twMerge } from "tailwind-merge";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={twMerge(
        "flex h-9 w-full rounded-md border border-seperator-opaque px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

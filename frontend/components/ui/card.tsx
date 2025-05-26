import { twMerge } from "tailwind-merge";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={twMerge(
        "rounded-xl border-text-muted bg-background-secondary shadow",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={twMerge("p-6 pt-0", className)} {...props} />;
}

export function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={twMerge("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={twMerge("text-sm text-text-muted", className)} {...props} />
  );
}

export function CardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={twMerge("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={twMerge(
        "font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

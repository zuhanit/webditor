import { cva, VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Slot } from "@/components/ui/slot";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-6",
      },
      variant: {
        default:
          "bg-background-primary text-primary-foreground hover:bg-background-secondary",
        outline:
          "border border-input hover:bg-background-secondary hover:text-primary-foreground",
        secondary:
          "bg-background-secondary text-primary-foreground hover:bg-background-secondary/80",
        ghost: "hover:bg-background-secondary hover:text-primary-foreground",
        link: "text-primary hover:underline hover:underline-offset-4",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ size, variant, asChild, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      className={twMerge(buttonVariants({ size, variant }), props.className)}
      {...props}
    />
  );
}

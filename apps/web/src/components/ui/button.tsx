import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center rounded border px-4 py-2 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "border-[var(--accent)] bg-[var(--accent)] text-[#fffcf5] hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)]",
        outline:
          "border-[var(--rule-strong)] bg-transparent text-[var(--ink)] hover:border-[var(--ink-soft)] hover:bg-[var(--paper-muted)]",
      },
      size: {
        default: "px-4 py-2",
        sm: "min-h-9 px-3 py-1.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

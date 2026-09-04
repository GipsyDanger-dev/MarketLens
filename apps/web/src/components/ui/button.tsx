import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-bold transition-[background-color,border-color,color,transform,box-shadow] duration-180 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 active:translate-y-px [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-[var(--accent)] bg-[var(--accent)] text-white shadow-[0_1px_2px_rgb(11_18_32/0.1)] hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] hover:shadow-[0_8px_22px_rgb(49_94_245/0.2)]",
        outline:
          "border-[var(--rule-strong)] bg-[var(--paper)] text-[var(--ink)] hover:border-[#8792a5] hover:bg-[var(--paper-muted)]",
        ghost:
          "border-transparent bg-transparent text-[var(--ink-soft)] hover:bg-[var(--paper-muted)] hover:text-[var(--ink)]",
        danger:
          "border-[var(--danger)] bg-[var(--danger)] text-white hover:border-[#8f1c13] hover:bg-[#8f1c13]",
      },
      size: {
        default: "px-4 py-2",
        sm: "min-h-9 px-3 py-1.5 text-xs",
        lg: "min-h-12 px-5 py-3 text-[0.95rem]",
        icon: "size-11 px-0",
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

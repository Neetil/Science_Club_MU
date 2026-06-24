import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-500/40 hover:bg-cyan-500/30 active:bg-cyan-500/40",
        variant === "secondary" &&
          "bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10 active:bg-white/15",
        variant === "ghost" && "text-zinc-300 hover:bg-white/5 hover:text-white",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        className,
      )}
      {...props}
    />
  );
}

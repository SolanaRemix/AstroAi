import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        {
          "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500":
            variant === "primary",
          "bg-white/10 text-white hover:bg-white/20 focus:ring-white/50":
            variant === "secondary",
          "border border-indigo-400 text-indigo-300 hover:bg-indigo-900/40 focus:ring-indigo-500":
            variant === "outline",
          "text-indigo-300 hover:text-white hover:bg-white/10 focus:ring-indigo-500":
            variant === "ghost",
          "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500":
            variant === "danger",
        },
        {
          "px-3 py-1.5 text-sm": size === "sm",
          "px-5 py-2.5 text-base": size === "md",
          "px-7 py-3.5 text-lg": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

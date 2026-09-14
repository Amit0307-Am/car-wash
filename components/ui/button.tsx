import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  target?: string;
  rel?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

const variantClasses = {
  primary:
    "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20",
  secondary:
    "border border-white/15 bg-white/5 text-white hover:border-amber-400/60 hover:bg-white/10",
  ghost: "text-amber-300 hover:text-amber-200",
};

export function Button({
  children,
  href,
  variant = "primary",
  className = "",
  target,
  rel,
  type = "button",
  onClick,
  disabled = false,
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={classes}
        aria-disabled={disabled}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

import type { ButtonHTMLAttributes } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className, type = "button", ...props }: ButtonProps) {
  const classes = [
    "inline-flex min-h-11 items-center justify-center rounded-md bg-brand-900 px-4 py-2",
    "text-sm font-semibold text-white shadow-sm transition-colors",
    "hover:bg-brand-700 focus-visible:outline focus-visible:outline-2",
    "focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-not-allowed",
    "disabled:opacity-60",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return <button className={classes} type={type} {...props} />;
}

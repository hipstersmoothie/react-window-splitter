"use client";

import { Button, ButtonProps, Link, LinkProps } from "react-aria-components";

const DEFAULT_BUTTON_CLASSES = "bg-gray-ghost p-2 rounded";

export function IconButton({ className, ...props }: ButtonProps) {
  return (
    <Button className={`${DEFAULT_BUTTON_CLASSES} ${className}`} {...props} />
  );
}

export function IconLink({ children, className, ...props }: LinkProps) {
  return (
    <Link className={`${DEFAULT_BUTTON_CLASSES} ${className}`} {...props}>
      {children}
    </Link>
  );
}

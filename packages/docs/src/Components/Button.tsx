"use client";

import {
  Button as ButtonPrimitive,
  ButtonProps,
  Link,
  LinkProps,
} from "react-aria-components";

const DEFAULT_BUTTON_CLASSES =
  "bg-blue-solid border-blue-normal text-blue-1 dark:text-bluedark-1 rounded-lg px-3 py-1 text-lg";

export function Button({ className, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      className={`${DEFAULT_BUTTON_CLASSES} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({ children, className, ...props }: LinkProps) {
  return (
    <Link className={`${DEFAULT_BUTTON_CLASSES} ${className}`} {...props}>
      {children}
    </Link>
  );
}

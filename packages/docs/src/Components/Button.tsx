"use client";

import {
  Button as ButtonPrimitive,
  ButtonProps,
  Link,
  LinkProps,
} from "react-aria-components";

const variants = {
  primary: "bg-blue-solid rounded-lg px-3 py-1 text-lg flex items-center gap-2",
  secondary:
    "bg-gray-action rounded-lg px-3 py-1 text-lg flex items-center gap-2",
};

interface VariantProps {
  variant?: "primary" | "secondary";
}

interface IconProps {
  icon?: React.ReactNode;
}

export function Button({
  className,
  variant = "primary",
  children,
  icon,
  ...props
}: Omit<ButtonProps, "children"> &
  VariantProps &
  IconProps & { children: React.ReactNode }) {
  return (
    <ButtonPrimitive
      className={({ isFocusVisible }) => {
        return `${variants[variant]} ${className} ${isFocusVisible ? "" : "focus:outline-none"}`;
      }}
      {...props}
    >
      {icon}
      {children}
    </ButtonPrimitive>
  );
}

export function ButtonLink({
  children,
  className,
  variant = "primary",
  icon,
  ...props
}: Omit<LinkProps, "children"> &
  VariantProps &
  IconProps & { children: React.ReactNode }) {
  return (
    <Link
      className={({ isFocusVisible }) => {
        return `${variants[variant]} ${className} ${isFocusVisible ? "" : "focus:outline-none"}`;
      }}
      {...props}
    >
      {icon}
      {children}
    </Link>
  );
}

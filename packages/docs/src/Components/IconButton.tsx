"use client";

import { Link, LinkProps } from "react-aria-components";

export function IconLink({ children, ...props }: LinkProps) {
  return (
    <Link className="bg-gray-ghost p-2 rounded" {...props}>
      {children}
    </Link>
  );
}

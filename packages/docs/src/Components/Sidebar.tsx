"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarItem({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  console.log({ pathname, path });
  return (
    <li>
      <Link
        href={path}
        className={`
          h-10 flex items-center px-4 rounded-lg bg-gray-ghost
          ${pathname === path ? "bg-gray-action" : ""}
        `}
      >
        {children}
      </Link>
    </li>
  );
}

export function SidebarGroup({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: React.ReactNode;
}) {
  return (
    <div>
      {title && (
        <div className="text-gray-normal text-sm font-bold px-4 h-6 flex items-center">
          {title}
        </div>
      )}
      <ul className="flex flex-col gap-1">{children}</ul>
    </div>
  );
}

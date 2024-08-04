import {
  OverlayArrow,
  Tooltip as TooltipPrimitive,
  TooltipProps,
} from "react-aria-components";

export function Tooltip({
  children,
  className,
  ...props
}: Omit<TooltipProps, "className" | "children"> & {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <TooltipPrimitive
      className={`
        ${className} 
        text-sm
        rounded px-2 py-1
        bg-graydark-3 dark:bg-gray-3
        text-graydark-12 dark:text-gray-11
      `}
      offset={8}
      {...props}
    >
      <OverlayArrow>
        <svg width={8} height={8} viewBox="0 0 8 8">
          <path d="M0 0 L4 4 L8 0" />
        </svg>
      </OverlayArrow>
      {children}
    </TooltipPrimitive>
  );
}

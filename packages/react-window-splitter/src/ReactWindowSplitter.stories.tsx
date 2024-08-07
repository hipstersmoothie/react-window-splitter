"use client";

import { useEffect, useRef, useState } from "react";
import {
  PanelGroup as PanelGroupPrimitive,
  PanelGroupProps,
  Panel as PanelPrimitive,
  PanelProps,
  PanelResizer as PanelResizerPrimitive,
  PanelResizerProps,
} from "../../../react-window-splitter/dist/esm/ReactWindowSplitter";

export function ColorfulPanelGroup(props: PanelGroupProps) {
  return <PanelGroupPrimitive {...props} className={`${props.className}`} />;
}

export function ColorfulPanel({
  color,
  displayDimensions = "width",
  className,
  children,
  ...props
}: PanelProps & {
  color?: "green" | "red" | "pink" | "blue" | "orange";
  displayDimensions?: "width" | "height" | "both";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<
    { width: number; height: number } | undefined
  >();

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      setDimensions({
        width: entry.borderBoxSize[0].inlineSize,
        height: entry.borderBoxSize[0].blockSize,
      });
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [props.id]);

  let wrapperClassName = "";
  let lineClassName = "";

  if (color === "green") {
    wrapperClassName =
      "border-4 bg-green-3 dark:bg-greendark-3 border-green-9 dark:border-greendark-9 text-green-normal";
    lineClassName = "bg-greena-7 dark:bg-greenadark-7";
  } else if (color === "red") {
    wrapperClassName =
      "border-4 bg-red-3 dark:bg-reddark-3 border-red-9 dark:border-reddark-9 text-red-normal";
    lineClassName = "bg-reda-7 dark:bg-redadark-7";
  } else if (color === "pink") {
    wrapperClassName =
      "border-4 bg-pink-3 dark:bg-pinkdark-3 border-pink-9 dark:border-pinkdark-9 text-pink-normal";
    lineClassName = "bg-pinka-7 dark:bg-pinkadark-7";
  } else if (color === "blue") {
    wrapperClassName =
      "border-4 bg-blue-3 dark:bg-bluedark-3 border-blue-9 dark:border-bluedark-9 text-blue-normal";
    lineClassName = "bg-bluea-7 dark:bg-blueadark-7";
  } else if (color === "orange") {
    wrapperClassName =
      "border-4 bg-orange-3 dark:bg-orangedark-3 border-orange-9 dark:border-orangedark-9 text-orange-normal";
    lineClassName = "bg-orangea-7 dark:bg-orangeadark-7";
  }

  return (
    <PanelPrimitive
      ref={ref}
      {...props}
      className={`overflow-hidden flex items-center justify-center ${wrapperClassName} ${className}`}
    >
      {children
        ? children
        : dimensions && (
            <span className="flex items-center font-mono w-full mx-2">
              <span className={`${lineClassName} h-0.5 flex-1`} />
              <span className={`p-2`}>
                {(displayDimensions === "width"
                  ? dimensions.width
                  : displayDimensions === "height"
                    ? dimensions.height
                    : 0
                ).toFixed(2)}
                px
              </span>
              <span className={`${lineClassName} h-0.5 flex-1`} />
            </span>
          )}
    </PanelPrimitive>
  );
}

export function ColorfulPanelResizer(props: PanelResizerProps) {
  return (
    <PanelResizerPrimitive
      {...props}
      size="20px"
      className="h-full relative group"
    >
      <div
        className="
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full
          group-data-[handle-orientation='horizontal']:w-2 group-data-[handle-orientation='horizontal']:h-8
          group-data-[handle-orientation='vertical']:w-8 group-data-[handle-orientation='vertical']:h-2
          bg-gray-action border border-gray-normal 
          group-data-[state='dragging']:bg-blue-6 group-data-[state='dragging']:border-blue-10
          dark:group-data-[state='dragging']:bg-bluedark-6 dark:group-data-[state='dragging']:border-bluedark-10
          group-focus:bg-blue-9 group-focus:border-blue-10
          dark:group-focus:bg-bluedark-9 dark:group-focus:border-bluedark-10
        "
      />
    </PanelResizerPrimitive>
  );
}

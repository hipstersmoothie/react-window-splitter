"use client";

import { useEffect, useRef, useState } from "react";
import {
  PanelGroup as PanelGroupPrimitive,
  PanelGroupProps,
  Panel as PanelPrimitive,
  PanelProps,
  PanelResizer as PanelResizerPrimitive,
} from "react-window-splitter";

function PanelGroup(props: PanelGroupProps) {
  return <PanelGroupPrimitive {...props} className={`${props.className}`} />;
}

function Panel({ color, ...props }: PanelProps & { color: "green" | "red" }) {
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
      "bg-green-3 dark:bg-greendark-3 border-green-9 dark:border-greendark-9 text-green-normal";
    lineClassName = "bg-greena-7 dark:bg-greenadark-7";
  } else if (color === "red") {
    wrapperClassName =
      "bg-red-3 dark:bg-reddark-3 border-red-9 dark:border-reddark-9 text-red-normal";
    lineClassName = "bg-reda-7 dark:bg-redadark-7";
  }

  return (
    <PanelPrimitive
      ref={ref}
      {...props}
      className={`border-4 overflow-hidden flex items-center justify-center ${wrapperClassName}`}
    >
      {dimensions && (
        <span className="flex items-center font-mono w-full">
          <span className={`${lineClassName} h-0.5 mx-2 flex-1`} />
          <span className={`p-2`}>{dimensions.width.toFixed(2)}px</span>
          <span className={`${lineClassName} h-0.5 mx-2 flex-1`} />
        </span>
      )}
    </PanelPrimitive>
  );
}

function PanelResizer(props: any) {
  return (
    <PanelResizerPrimitive
      {...props}
      size="20px"
      className="h-full relative group"
    >
      <div
        className="
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-8 rounded-full
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

export default function HeaderExample() {
  return (
    <PanelGroup id="group" className="max-w-2xl w-full" style={{ height: 200 }}>
      <Panel color="green" min="130px" max="400px" id="1" />
      <PanelResizer id="2" />
      <Panel color="red" min="130px" id="3" />
    </PanelGroup>
  );
}

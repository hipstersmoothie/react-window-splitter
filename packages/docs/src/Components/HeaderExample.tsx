"use client";

import { useEffect, useRef, useState } from "react";
import {
  PanelGroup as PanelGroupPrimitive,
  PanelGroupProps,
  Panel as PanelPrimitive,
  PanelProps,
  PanelResizer as PanelResizerPrimitive,
} from "react-resizable-grid-panels";

function PanelGroup(props: PanelGroupProps) {
  return <PanelGroupPrimitive {...props} className={`${props.className}`} />;
}

const borders = {
  green: "border-green-500",
  red: "border-red-500",
};

const backgrounds = {
  green: "bg-green-200 bg-opacity-60 text-green-800",
  red: "bg-red-200 bg-opacity-60 text-red-800",
};

const solidBackgrounds = {
  green: "bg-green-500 text-white",
  red: "bg-red-500 text-white",
};

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

  return (
    <PanelPrimitive
      ref={ref}
      {...props}
      className={` bg-gray-200 border-4 overflow-hidden ${borders[color]} ${backgrounds[color]} flex items-center justify-center text-gray-800`}
    >
      {dimensions && (
        <span className="flex items-center font-mono w-full">
          <span className={`${solidBackgrounds[color]} h-1 mx-2 flex-1`} />
          <span className={`${solidBackgrounds[color]} p-2`}>
            {dimensions.width.toFixed(2)}px
          </span>
          <span className={`${solidBackgrounds[color]} h-1 mx-2 flex-1`} />
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
          bg-gray-300 group-hover:bg-gray-400 group-data-[state='dragging']:bg-blue-500
        "
      />
    </PanelResizerPrimitive>
  );
}

export default function HeaderExample() {
  return (
    <PanelGroup id="group" className="max-w-xl w-full" style={{ height: 200 }}>
      <Panel color="green" min="130px" id="1" />
      <PanelResizer id="2" />
      <Panel color="red" min="130px" id="3" />
    </PanelGroup>
  );
}

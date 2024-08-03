"use client";

import { Inter } from "next/font/google";
import {
  PanelGroup as PanelGroupPrimitive,
  PanelGroupProps,
  Panel as PanelPrimitive,
  PanelResizer as PanelResizerPrimitive,
} from "react-resizable-grid-panels";

import dynamic from "next/dynamic";

const HeaderExample = dynamic(() => import("@/Components/HeaderExample"), {
  ssr: false,
});

function PanelGroup(props: PanelGroupProps) {
  return (
    <PanelGroupPrimitive
      {...props}
      className={`flex space-x-4 border border-gray-400 ${props.className}`}
    />
  );
}

function Panel(props: any) {
  return <PanelPrimitive {...props} className="w-32 h-32 bg-gray-200" />;
}

function PanelResizer(props: any) {
  return (
    <PanelResizerPrimitive
      {...props}
      size="4px"
      className="h-full bg-gray-300"
    />
  );
}

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className={`${inter.className}`}>
      <div className="flex flex-col items-center py-24">
        <h1 className="font-black text-6xl">react-resizable-grid-panels</h1>

        <HeaderExample />
      </div>
    </main>
  );
}

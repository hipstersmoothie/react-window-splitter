import {
  PanelGroup as PanelGroupPrimitive,
  PanelGroupProps,
  Panel as PanelPrimitive,
  PanelResizer as PanelResizerPrimitive,
} from "react-resizable-grid-panels";

function PanelGroup(props: PanelGroupProps) {
  return <PanelGroupPrimitive {...props} className={`${props.className}`} />;
}

function Panel(props: any) {
  return (
    <PanelPrimitive
      {...props}
      className="bg-gray-200 border rounded-xl overflow-hidden border-gray-400 flex items-center justify-center text-gray-800"
    />
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
      <Panel min="60px" id="1">
        1
      </Panel>
      <PanelResizer id="2" />
      <Panel min="60px" id="3">
        3
      </Panel>
    </PanelGroup>
  );
}

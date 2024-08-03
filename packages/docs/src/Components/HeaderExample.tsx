import {
  PanelGroup as PanelGroupPrimitive,
  PanelGroupProps,
  Panel as PanelPrimitive,
  PanelResizer as PanelResizerPrimitive,
} from "react-resizable-grid-panels";

function PanelGroup(props: PanelGroupProps) {
  return (
    <PanelGroupPrimitive
      {...props}
      className={`border border-gray-400 ${props.className}`}
    />
  );
}

function Panel(props: any) {
  return <PanelPrimitive {...props} className="bg-gray-200" />;
}

function PanelResizer(props: any) {
  return (
    <PanelResizerPrimitive
      {...props}
      size="4px"
      className="h-full bg-red-500"
    />
  );
}

export default function HeaderExample() {
  return (
    <PanelGroup id="group" className="max-w-xl w-full">
      <Panel id="1">1</Panel>
      <PanelResizer id="2" />
      <Panel id="3">3</Panel>
    </PanelGroup>
  );
}

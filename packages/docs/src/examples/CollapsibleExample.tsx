import { PanelGroup, Panel, PanelResizer } from "react-window-splitter";

function CollapsibleExample() {
  return (
    <PanelGroup>
      <Panel collapsible collapsedSize="100px" min="150px" max="400px" />
      <PanelResizer />
      <Panel min="130px" />
    </PanelGroup>
  );
}

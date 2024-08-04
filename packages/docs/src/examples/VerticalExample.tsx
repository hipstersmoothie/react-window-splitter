import { PanelGroup, Panel, PanelResizer } from "react-window-splitter";

function VerticalExample() {
  return (
    <PanelGroup orientation="vertical">
      <Panel min="130px" max="400px" />
      <PanelResizer />
      <Panel min="130px" />
    </PanelGroup>
  );
}

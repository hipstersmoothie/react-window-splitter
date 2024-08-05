import { PanelGroup, Panel, PanelResizer } from "react-window-splitter";

function VerticalExample() {
  return (
    <PanelGroup orientation="vertical">
      <Panel min="50px" max="300px" />
      <PanelResizer />
      <Panel min="50px" />
    </PanelGroup>
  );
}

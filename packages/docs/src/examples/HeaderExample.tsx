import { PanelGroup, Panel, PanelResizer } from "react-window-splitter";

function Example() {
  return (
    <PanelGroup>
      <Panel min="130px" max="400px" />
      <PanelResizer />
      <Panel min="130px" />
    </PanelGroup>
  );
}

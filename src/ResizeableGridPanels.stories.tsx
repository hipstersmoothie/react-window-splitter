import React from "react";
import { PanelGroup, Panel, PanelResizer } from "./ResizeableGridPanels.jsx";

export default {
  title: "Components/ResizeableGridPanels",
};

export function Simple() {
  return (
    <PanelGroup>
      <Panel>
        <div>Panel 1</div>
      </Panel>
      <PanelResizer />
      <Panel>
        <div>Panel 2</div>
      </Panel>
    </PanelGroup>
  );
}

export function SimpleMin() {
  return (
    <PanelGroup>
      <Panel min="100px">
        <div>Panel 1</div>
      </Panel>
      <PanelResizer />
      <Panel min="100px">
        <div>Panel 2</div>
      </Panel>
      <PanelResizer />
      <Panel min="100px">
        <div>Panel 3</div>
      </Panel>
    </PanelGroup>
  );
}

export function SimpleMinMax() {
  return (
    <PanelGroup>
      <Panel min="100px" max="200px">
        <div>Panel 1</div>
      </Panel>
      <PanelResizer />
      <Panel min="100px">
        <div>Panel 2</div>
      </Panel>
      <PanelResizer />
      <Panel min="100px">
        <div>Panel 3</div>
      </Panel>
    </PanelGroup>
  );
}

export function SimpleConstraints() {
  return (
    <PanelGroup>
      <Panel min="100px" max="50%">
        <div>Panel 1</div>
      </Panel>
      <PanelResizer />
      <Panel>
        <div>Panel 2</div>
      </Panel>
    </PanelGroup>
  );
}

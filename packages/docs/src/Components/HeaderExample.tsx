"use client";
import {
  ColorfulPanel,
  ColorfulPanelGroup,
  ColorfulPanelResizer,
} from "./ColorfulPanels";

export default function HeaderExample() {
  return (
    <ColorfulPanelGroup
      id="group"
      className="max-w-2xl w-full"
      style={{ height: 200 }}
    >
      <ColorfulPanel color="green" min="130px" max="400px" id="1" />
      <ColorfulPanelResizer id="2" />
      <ColorfulPanel color="red" min="130px" id="3" />
    </ColorfulPanelGroup>
  );
}

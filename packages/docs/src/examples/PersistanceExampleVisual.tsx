import {
  ColorfulPanel,
  ColorfulPanelGroup,
  ColorfulPanelResizer,
} from "../Components/ColorfulPanels";

export function PersistanceExampleVisual() {
  return (
    <ColorfulPanelGroup
      autosaveId="autosave"
      autosaveStrategy="cookie"
      style={{ height: 200 }}
    >
      <ColorfulPanel color="red" id="panel-1" min="130px" />
      <ColorfulPanelResizer id="resizer-1" />
      <ColorfulPanel color="blue" id="panel-2" min="130px" />
    </ColorfulPanelGroup>
  );
}

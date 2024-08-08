import { PanelGroupProps } from "react-window-splitter";
import {
  ColorfulPanel,
  ColorfulPanelGroup,
  ColorfulPanelResizer,
} from "../Components/ColorfulPanels";

export async function PersistanceExampleVisual({
  snapshot,
}: {
  snapshot: PanelGroupProps["snapshot"];
}) {
  return (
    <ColorfulPanelGroup
      autosaveId="autosave"
      autosaveStrategy="cookie"
      snapshot={snapshot}
      style={{ height: 200 }}
    >
      <ColorfulPanel color="red" id="panel-1" min="130px" />
      <ColorfulPanelResizer id="resizer-1" />
      <ColorfulPanel color="blue" id="panel-2" min="130px" />
    </ColorfulPanelGroup>
  );
}

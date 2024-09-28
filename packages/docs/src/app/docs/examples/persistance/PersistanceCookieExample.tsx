import { cookies } from "next/headers";
import { PanelGroup, Panel, PanelResizer } from "react-window-splitter";

export async function PersistanceExamplePage() {
  const allCookies = await cookies();
  const persistedState = allCookies.get("autosave");
  const snapshot = persistedState
    ? JSON.parse(persistedState.value)
    : undefined;

  return (
    <PanelGroup
      autosaveId="autosave"
      autosaveStrategy="cookie"
      snapshot={snapshot}
      style={{ height: 200 }}
    >
      <Panel id="panel-1" min="130px" max="400px" />
      <PanelResizer id="resizer-1" />
      <Panel id="panel-2" min="130px" />
    </PanelGroup>
  );
}

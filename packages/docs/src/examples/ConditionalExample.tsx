import { useState } from "react";
import { Panel, PanelGroup, PanelResizer } from "react-window-splitter";

export function ConditionalExample() {
  const [isThirdPanelRendered, setIsThirdPanelRendered] = useState(false);

  const togglePanel = () => setIsThirdPanelRendered(!isThirdPanelRendered);
  const closePanel = () => setIsThirdPanelRendered(false);

  return (
    <>
      <button onClick={togglePanel}>
        {isThirdPanelRendered ? "Hide" : "Show"} extra panel
      </button>

      <PanelGroup>
        <Panel min="100px" order={1}>
          1
        </Panel>
        <PanelResizer order={2} />
        <Panel min="100px" order={3}>
          2
        </Panel>
        {isThirdPanelRendered && (
          <>
            <PanelResizer order={4} />
            <Panel order={5} min="100px">
              <button onClick={closePanel}>close</button>
            </Panel>
          </>
        )}
      </PanelGroup>
    </>
  );
}

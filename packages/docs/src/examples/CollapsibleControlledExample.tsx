import { useState } from "react";
import { PanelGroup, Panel, PanelResizer } from "react-window-splitter";

function CollapsibleExample() {
  const [collapsed, setCollapsed] = useState(true);

  const onCollapseChange = (isCollapsed: boolean) => {
    // Do whatever logic you want here.
    // If you don't change the collapsed state, the panel
    // will not collapse.
    const shouldSetValue = true;

    if (shouldSetValue) {
      setCollapsed(isCollapsed);
    }
  };

  return (
    <PanelGroup>
      <Panel
        min="150px"
        max="400px"
        collapsible
        collapsedSize="100px"
        collapsed={collapsed}
        onCollapseChange={onCollapseChange}
      />
      <PanelResizer />
      <Panel min="130px" />
    </PanelGroup>
  );
}

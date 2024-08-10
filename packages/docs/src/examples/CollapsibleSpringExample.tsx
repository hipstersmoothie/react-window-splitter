"use client";

import { useMemo, useRef } from "react";
import { spring } from "framer-motion";
import {
  ColorfulPanel,
  ColorfulPanelGroup,
  ColorfulPanelResizer,
} from "../Components/ColorfulPanels";
import { Button } from "../Components/Button";
import { PanelHandle } from "react-window-splitter";

export function CustomCollapseAnimation() {
  const panelHandle = useRef<PanelHandle>(null);
  const springFn = useMemo(() => {
    return spring({
      keyframes: [0, 1],
      velocity: 0.0,
      stiffness: 100,
      damping: 10,
      mass: 1.0,
    });
  }, []);

  springFn.calculatedDuration;
  return (
    <div className="flex flex-col gap-6">
      <Button
        onPress={() => {
          if (panelHandle.current?.isExpanded()) {
            panelHandle.current?.collapse();
          } else {
            panelHandle.current?.expand();
          }
        }}
      >
        Toggle
      </Button>
      <ColorfulPanelGroup style={{ height: 200 }}>
        <ColorfulPanel color="blue" id="panel-1" min="100px">
          1
        </ColorfulPanel>
        <ColorfulPanelResizer id="resizer-2" />
        <ColorfulPanel
          handle={panelHandle}
          id="panel-10"
          color="orange"
          min="40%"
          collapsible
          collapsedSize="60px"
          defaultCollapsed
          collapseAnimation={{
            easing: (t) => springFn.next(t * 1000).value,
            duration: 1000,
          }}
        >
          2
        </ColorfulPanel>
      </ColorfulPanelGroup>
    </div>
  );
}

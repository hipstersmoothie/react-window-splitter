"use client";

import { useState } from "react";
import {
  ColorfulPanel,
  ColorfulPanelGroup,
  ColorfulPanelResizer,
} from "../../../../Components/ColorfulPanels";
import { IconButton } from "../../../../Components/IconButton";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Button } from "../../../../Components/Button";

export function ConditionalExample() {
  const [isThirdPanelRendered, setIsThirdPanelRendered] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <Button
        className="self-start"
        onPress={() => setIsThirdPanelRendered(!isThirdPanelRendered)}
      >
        {isThirdPanelRendered ? "Hide" : "Show"} extra panel
      </Button>
      <ColorfulPanelGroup style={{ height: 200 }}>
        <ColorfulPanel id="panel-1" color="green" min="100px">
          1
        </ColorfulPanel>
        <ColorfulPanelResizer id="resizer-1" />
        <ColorfulPanel id="panel-2" color="green" min="100px">
          2
        </ColorfulPanel>
        {isThirdPanelRendered && (
          <>
            <ColorfulPanelResizer id="resizer-2" />
            <ColorfulPanel id="panel-3" color="red" min="100px">
              <IconButton onPress={() => setIsThirdPanelRendered(false)}>
                <Cross1Icon />
              </IconButton>
            </ColorfulPanel>
          </>
        )}
      </ColorfulPanelGroup>
    </div>
  );
}

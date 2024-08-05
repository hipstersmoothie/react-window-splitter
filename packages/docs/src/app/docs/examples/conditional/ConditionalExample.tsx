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
        <ColorfulPanel color="green" min="100px" order={1}>
          1
        </ColorfulPanel>
        <ColorfulPanelResizer order={2} />
        <ColorfulPanel color="green" min="100px" order={3}>
          2
        </ColorfulPanel>
        {isThirdPanelRendered && (
          <>
            <ColorfulPanelResizer order={4} />
            <ColorfulPanel color="red" order={5} min="100px">
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

import {
  ColorfulPanel,
  ColorfulPanelGroup,
  ColorfulPanelResizer,
} from "../../../../Components/ColorfulPanels";
import { H1, InlineCode, Paragraph } from "../../../../Components/Content";
import { CodeBlock } from "mdxts/components";

export default function Simple() {
  return (
    <div>
      <H1>Simple</H1>
      <Paragraph>
        The most basic example of the window splitter presents just two panels.
      </Paragraph>
      <ColorfulPanelGroup style={{ height: 200 }}>
        <ColorfulPanel color="green" min="130px" max="400px" id="1" />
        <ColorfulPanelResizer id="2" />
        <ColorfulPanel color="red" min="130px" id="3" />
      </ColorfulPanelGroup>
      <Paragraph>
        <CodeBlock
          source="../../../../examples/HeaderExample.tsx"
          allowErrors={true}
          showToolbar={false}
        />
      </Paragraph>
      <Paragraph>
        You can also split the area vertically by using the{" "}
        <InlineCode>orientation</InlineCode> prop.
      </Paragraph>
      <ColorfulPanelGroup orientation="vertical" style={{ height: 400 }}>
        <ColorfulPanel
          displayDimensions="height"
          color="green"
          min="50px"
          max="300px"
          id="1"
        />
        <ColorfulPanelResizer id="2" />
        <ColorfulPanel
          displayDimensions="height"
          color="red"
          min="50px"
          id="3"
        />
      </ColorfulPanelGroup>
      <Paragraph>
        <CodeBlock
          source="../../../../examples/VerticalExample.tsx"
          allowErrors={true}
          showToolbar={false}
          focusedLines="5"
        />
      </Paragraph>
    </div>
  );
}
